from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import RequestStatus


class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    status: Mapped[RequestStatus] = mapped_column(
        Enum(RequestStatus, name="request_status"), nullable=False, default=RequestStatus.new, index=True
    )

    object_id: Mapped[int] = mapped_column(ForeignKey("protected_objects.id", ondelete="RESTRICT"), nullable=False)
    equipment_type_id: Mapped[int] = mapped_column(ForeignKey("equipment_types.id", ondelete="RESTRICT"), nullable=False)

    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    assigned_to_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    protected_object = relationship("ProtectedObject")
    equipment_type = relationship("EquipmentType")
    created_by = relationship("User", foreign_keys=[created_by_id])
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
    events = relationship("RequestEvent", back_populates="request", cascade="all, delete-orphan")


class RequestEvent(Base):
    __tablename__ = "request_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    request_id: Mapped[int] = mapped_column(ForeignKey("maintenance_requests.id", ondelete="CASCADE"), index=True)
    actor_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)

    event_type: Mapped[str] = mapped_column(String(50), nullable=False)  # status_change, comment, assignment, create
    message: Mapped[str | None] = mapped_column(Text, nullable=True)

    from_status: Mapped[RequestStatus | None] = mapped_column(Enum(RequestStatus, name="request_status"), nullable=True)
    to_status: Mapped[RequestStatus | None] = mapped_column(Enum(RequestStatus, name="request_status"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    request = relationship("MaintenanceRequest", back_populates="events")
    actor = relationship("User")

