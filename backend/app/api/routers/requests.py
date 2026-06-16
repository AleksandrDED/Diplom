from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.enums import RequestStatus, UserRole
from app.models.request import MaintenanceRequest, RequestEvent
from app.models.user import User
from app.schemas.requests import RequestAssign, RequestComment, RequestCreate, RequestOut, RequestStatusChange
from app.services.workflow import can_change_status

router = APIRouter(prefix="/requests", tags=["requests"])


def _load_request(db: Session, request_id: int) -> MaintenanceRequest | None:
    return (
        db.query(MaintenanceRequest)
        .options(
            joinedload(MaintenanceRequest.protected_object),
            joinedload(MaintenanceRequest.equipment_type),
            joinedload(MaintenanceRequest.created_by),
            joinedload(MaintenanceRequest.assigned_to),
            joinedload(MaintenanceRequest.events).joinedload(RequestEvent.actor),
        )
        .filter(MaintenanceRequest.id == request_id)
        .first()
    )


@router.get("", response_model=list[RequestOut])
def list_requests(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    status: RequestStatus | None = Query(default=None),
    object_id: int | None = Query(default=None),
    assigned_to_id: int | None = Query(default=None),
    q: str | None = Query(default=None, max_length=200),
) -> list[MaintenanceRequest]:
    query = db.query(MaintenanceRequest).options(
        joinedload(MaintenanceRequest.protected_object),
        joinedload(MaintenanceRequest.equipment_type),
        joinedload(MaintenanceRequest.created_by),
        joinedload(MaintenanceRequest.assigned_to),
        joinedload(MaintenanceRequest.events).joinedload(RequestEvent.actor),
    )

    if user.role == UserRole.requester:
        query = query.filter(MaintenanceRequest.created_by_id == user.id)

    if status:
        query = query.filter(MaintenanceRequest.status == status)
    if object_id:
        query = query.filter(MaintenanceRequest.object_id == object_id)
    if assigned_to_id:
        query = query.filter(MaintenanceRequest.assigned_to_id == assigned_to_id)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(MaintenanceRequest.title.ilike(like) | MaintenanceRequest.description.ilike(like))

    return query.order_by(MaintenanceRequest.id.desc()).limit(200).all()


@router.post("", response_model=RequestOut)
def create_request(payload: RequestCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> MaintenanceRequest:
    req = MaintenanceRequest(
        title=payload.title,
        description=payload.description,
        object_id=payload.object_id,
        equipment_type_id=payload.equipment_type_id,
        created_by_id=user.id,
        status=RequestStatus.new,
    )
    db.add(req)
    db.flush()
    db.add(
        RequestEvent(
            request_id=req.id,
            actor_id=user.id,
            event_type="create",
            message="Заявка создана",
        )
    )
    db.commit()
    return _load_request(db, req.id)  # type: ignore[return-value]


@router.get("/{request_id}", response_model=RequestOut)
def get_request(request_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> MaintenanceRequest:
    req = _load_request(db, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Not found")
    if user.role == UserRole.requester and req.created_by_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return req


@router.patch(
    "/{request_id}/assign",
    response_model=RequestOut,
    dependencies=[Depends(require_roles(UserRole.admin, UserRole.manager, UserRole.engineer))],
)
def assign_request(
    request_id: int,
    payload: RequestAssign,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> MaintenanceRequest:
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Not found")

    old = req.assigned_to_id
    req.assigned_to_id = payload.assigned_to_id

    db.add(
        RequestEvent(
            request_id=req.id,
            actor_id=user.id,
            event_type="assignment",
            message=f"Назначение исполнителя: {old} -> {payload.assigned_to_id}",
        )
    )

    if req.status == RequestStatus.new and payload.assigned_to_id is not None:
        req.status = RequestStatus.assigned
        db.add(
            RequestEvent(
                request_id=req.id,
                actor_id=user.id,
                event_type="status_change",
                from_status=RequestStatus.new,
                to_status=RequestStatus.assigned,
                message="Автоперевод в assigned при назначении",
            )
        )

    db.commit()
    return _load_request(db, req.id)  # type: ignore[return-value]


@router.patch("/{request_id}/status", response_model=RequestOut)
def change_status(
    request_id: int,
    payload: RequestStatusChange,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> MaintenanceRequest:
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Not found")
    if user.role == UserRole.requester and req.created_by_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    from_status = req.status
    to_status = payload.status
    if from_status == to_status:
        raise HTTPException(status_code=400, detail="Status is the same")
    if not can_change_status(user.role, from_status, to_status):
        raise HTTPException(status_code=400, detail="Transition not allowed")

    req.status = to_status
    if to_status in (RequestStatus.done, RequestStatus.cancelled):
        req.closed_at = datetime.now(timezone.utc)

    db.add(
        RequestEvent(
            request_id=req.id,
            actor_id=user.id,
            event_type="status_change",
            from_status=from_status,
            to_status=to_status,
            message=payload.comment,
        )
    )
    db.commit()
    return _load_request(db, req.id)  # type: ignore[return-value]


@router.post("/{request_id}/comments", response_model=RequestOut)
def add_comment(
    request_id: int,
    payload: RequestComment,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> MaintenanceRequest:
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Not found")
    if user.role == UserRole.requester and req.created_by_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    db.add(
        RequestEvent(
            request_id=req.id,
            actor_id=user.id,
            event_type="comment",
            message=payload.message,
        )
    )
    db.commit()
    return _load_request(db, req.id)  # type: ignore[return-value]

