from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import UserRole


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None
    role: UserRole
    is_active: bool

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str | None = Field(default=None, max_length=200)
    role: UserRole = UserRole.requester
    password: str = Field(min_length=8, max_length=200)

