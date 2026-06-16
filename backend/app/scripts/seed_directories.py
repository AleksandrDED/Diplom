from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.base import Base
from app.models.directory import EquipmentType, ProtectedObject

OBJECTS = [
    {"name": "Офисный центр «Север»", "address": "г. Москва, ул. Ленина, 12", "code": "OBJ-001"},
    {"name": "Склад №3", "address": "г. Москва, Промышленная, 44", "code": "OBJ-002"},
    {"name": "Производственный цех", "address": "г. Москва, Заводская, 7", "code": "OBJ-003"},
]

EQUIPMENT_TYPES = [
    {"name": "Системы видеонаблюдения", "description": "Камеры, регистраторы, серверы видеоаналитики"},
    {"name": "СКУД", "description": "Контроллеры доступа, считыватели, турникеты"},
    {"name": "Охранная сигнализация", "description": "Датчики, приёмно-контрольные приборы"},
    {"name": "Пожарная сигнализация", "description": "Извещатели, панели, оповещатели"},
]


def main() -> None:
    engine = create_engine(settings.database_url, future=True)
    Base.metadata.create_all(bind=engine)

    with Session(engine) as db:
        for item in OBJECTS:
            exists = db.query(ProtectedObject).filter(ProtectedObject.code == item["code"]).first()
            if not exists:
                db.add(ProtectedObject(**item))

        for item in EQUIPMENT_TYPES:
            exists = db.query(EquipmentType).filter(EquipmentType.name == item["name"]).first()
            if not exists:
                db.add(EquipmentType(**item))

        db.commit()
        objects = db.query(ProtectedObject).count()
        types = db.query(EquipmentType).count()
        print(f"Справочники: объектов — {objects}, типов ТСО — {types}")


if __name__ == "__main__":
    main()
