from __future__ import annotations

from pydantic import BaseModel, Field


class ProtectedObjectBase(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    address: str = Field(min_length=2, max_length=300)
    code: str | None = Field(default=None, max_length=50)


class ProtectedObjectCreate(ProtectedObjectBase):
    pass


class ProtectedObjectOut(ProtectedObjectBase):
    id: int

    model_config = {"from_attributes": True}


class EquipmentTypeBase(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    description: str | None = Field(default=None, max_length=500)


class EquipmentTypeCreate(EquipmentTypeBase):
    pass


class EquipmentTypeOut(EquipmentTypeBase):
    id: int

    model_config = {"from_attributes": True}

