from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import RequestStatus
from app.schemas.directories import EquipmentTypeOut, ProtectedObjectOut
from app.schemas.users import UserOut


class RequestCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=3, max_length=10_000)
    object_id: int
    equipment_type_id: int


class RequestAssign(BaseModel):
    assigned_to_id: int | None


class RequestStatusChange(BaseModel):
    status: RequestStatus
    comment: str | None = Field(default=None, max_length=2000)


class RequestComment(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class RequestEventOut(BaseModel):
    id: int
    event_type: str
    message: str | None
    from_status: RequestStatus | None
    to_status: RequestStatus | None
    created_at: datetime
    actor: UserOut

    model_config = {"from_attributes": True}


class RequestOut(BaseModel):
    id: int
    title: str
    description: str
    status: RequestStatus
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None

    protected_object: ProtectedObjectOut
    equipment_type: EquipmentTypeOut
    created_by: UserOut
    assigned_to: UserOut | None
    events: list[RequestEventOut]

    model_config = {"from_attributes": True}

