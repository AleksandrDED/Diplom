from __future__ import annotations

import csv
import io
from datetime import date, datetime, time, timezone

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.request import MaintenanceRequest

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/summary", dependencies=[Depends(require_roles(UserRole.admin, UserRole.manager))])
def summary(db: Session = Depends(get_db)):
    rows = (
        db.query(MaintenanceRequest.status, func.count(MaintenanceRequest.id))
        .group_by(MaintenanceRequest.status)
        .all()
    )
    return {"by_status": [{"status": str(s), "count": int(c)} for (s, c) in rows]}


@router.get("/requests.csv", dependencies=[Depends(require_roles(UserRole.admin, UserRole.manager))])
def export_requests_csv(
    db: Session = Depends(get_db),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
) -> Response:
    q = db.query(MaintenanceRequest).order_by(MaintenanceRequest.id.desc())
    if from_date:
        start = datetime.combine(from_date, time.min).replace(tzinfo=timezone.utc)
        q = q.filter(MaintenanceRequest.created_at >= start)
    if to_date:
        end = datetime.combine(to_date, time.max).replace(tzinfo=timezone.utc)
        q = q.filter(MaintenanceRequest.created_at <= end)

    buf = io.StringIO()
    writer = csv.writer(buf, delimiter=";")
    writer.writerow(["id", "title", "status", "object_id", "equipment_type_id", "created_by_id", "assigned_to_id", "created_at", "closed_at"])
    for r in q.limit(50_000).all():
        writer.writerow([r.id, r.title, r.status.value, r.object_id, r.equipment_type_id, r.created_by_id, r.assigned_to_id, r.created_at, r.closed_at])

    content = buf.getvalue().encode("utf-8-sig")
    return Response(
        content=content,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="requests.csv"'},
    )

