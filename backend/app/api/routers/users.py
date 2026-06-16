from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.security import hash_password
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.users import UserCreate, UserOut

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.post("", response_model=UserOut, dependencies=[Depends(require_roles(UserRole.admin))])
def create_user(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    exists = db.query(User).filter(User.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=409, detail="User already exists")
    user = User(
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
        password_hash=hash_password(payload.password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("", response_model=list[UserOut], dependencies=[Depends(require_roles(UserRole.admin, UserRole.manager))])
def list_users(db: Session = Depends(get_db)) -> list[User]:
    return db.query(User).order_by(User.id.desc()).all()

