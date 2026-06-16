from __future__ import annotations

import argparse

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base
from app.models.enums import UserRole
from app.models.user import User


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--full-name", default="Администратор")
    args = parser.parse_args()

    engine = create_engine(settings.database_url, future=True)
    Base.metadata.create_all(bind=engine)

    with Session(engine) as db:
        exists = db.query(User).filter(User.email == args.email).first()
        if exists:
            raise SystemExit("User already exists")
        user = User(
            email=args.email,
            full_name=args.full_name,
            role=UserRole.admin,
            password_hash=hash_password(args.password),
            is_active=True,
        )
        db.add(user)
        db.commit()
        print(f"Created admin: {user.email}")


if __name__ == "__main__":
    main()

