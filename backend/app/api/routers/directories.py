from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.directory import EquipmentType, ProtectedObject
from app.models.enums import UserRole
from app.schemas.directories import (
    EquipmentTypeCreate,
    EquipmentTypeOut,
    ProtectedObjectCreate,
    ProtectedObjectOut,
)

router = APIRouter(prefix="/directories", tags=["directories"])


@router.get("/objects", response_model=list[ProtectedObjectOut])
def list_objects(db: Session = Depends(get_db)) -> list[ProtectedObject]:
    return db.query(ProtectedObject).order_by(ProtectedObject.name.asc()).all()


@router.post("/objects", response_model=ProtectedObjectOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.manager))])
def create_object(payload: ProtectedObjectCreate, db: Session = Depends(get_db)) -> ProtectedObject:
    if payload.code:
        exists = db.query(ProtectedObject).filter(ProtectedObject.code == payload.code).first()
        if exists:
            raise HTTPException(status_code=409, detail="Object code already exists")
    obj = ProtectedObject(name=payload.name, address=payload.address, code=payload.code)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/equipment-types", response_model=list[EquipmentTypeOut])
def list_equipment_types(db: Session = Depends(get_db)) -> list[EquipmentType]:
    return db.query(EquipmentType).order_by(EquipmentType.name.asc()).all()


@router.post(
    "/equipment-types",
    response_model=EquipmentTypeOut,
    dependencies=[Depends(require_roles(UserRole.admin, UserRole.manager))],
)
def create_equipment_type(payload: EquipmentTypeCreate, db: Session = Depends(get_db)) -> EquipmentType:
    exists = db.query(EquipmentType).filter(EquipmentType.name == payload.name).first()
    if exists:
        raise HTTPException(status_code=409, detail="Equipment type already exists")
    item = EquipmentType(name=payload.name, description=payload.description)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

