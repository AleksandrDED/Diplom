"""init

Revision ID: 0001_init
Revises:
Create Date: 2026-04-13

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None

USER_ROLES = ("admin", "manager", "engineer", "requester")
REQUEST_STATUSES = ("new", "assigned", "in_progress", "waiting", "done", "cancelled")


def _enum_column(name: str, enum_type, *, nullable=False):
    return sa.Column(name, enum_type, nullable=nullable)


def upgrade() -> None:
    bind = op.get_bind()
    is_pg = bind.dialect.name == "postgresql"

    if is_pg:
        user_role = postgresql.ENUM(*USER_ROLES, name="user_role", create_type=False)
        request_status = postgresql.ENUM(*REQUEST_STATUSES, name="request_status", create_type=False)
        user_role.create(bind, checkfirst=True)
        request_status.create(bind, checkfirst=True)
        bool_default = sa.text("true")
        ts_default = sa.text("now()")
    else:
        user_role = sa.Enum(*USER_ROLES, name="user_role")
        request_status = sa.Enum(*REQUEST_STATUSES, name="request_status")
        bool_default = sa.text("1")
        ts_default = sa.text("(CURRENT_TIMESTAMP)")

    op.create_table(
        "equipment_types",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=ts_default, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=ts_default, nullable=False),
    )
    op.create_index("ix_equipment_types_name", "equipment_types", ["name"], unique=True)

    op.create_table(
        "protected_objects",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("address", sa.String(length=300), nullable=False),
        sa.Column("code", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=ts_default, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=ts_default, nullable=False),
    )
    op.create_index("ix_protected_objects_code", "protected_objects", ["code"], unique=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("full_name", sa.String(length=200), nullable=True),
        _enum_column("role", user_role, nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=bool_default),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=ts_default, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=ts_default, nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "maintenance_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        _enum_column("status", request_status, nullable=False),
        sa.Column("object_id", sa.Integer(), nullable=False),
        sa.Column("equipment_type_id", sa.Integer(), nullable=False),
        sa.Column("created_by_id", sa.Integer(), nullable=False),
        sa.Column("assigned_to_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=ts_default, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=ts_default, nullable=False),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["object_id"], ["protected_objects.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["equipment_type_id"], ["equipment_types.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["assigned_to_id"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_maintenance_requests_status", "maintenance_requests", ["status"], unique=False)

    op.create_table(
        "request_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("request_id", sa.Integer(), nullable=False),
        sa.Column("actor_id", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        _enum_column("from_status", request_status, nullable=True),
        _enum_column("to_status", request_status, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=ts_default, nullable=False),
        sa.ForeignKeyConstraint(["request_id"], ["maintenance_requests.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["actor_id"], ["users.id"], ondelete="RESTRICT"),
    )
    op.create_index("ix_request_events_request_id", "request_events", ["request_id"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    is_pg = bind.dialect.name == "postgresql"

    op.drop_index("ix_request_events_request_id", table_name="request_events")
    op.drop_table("request_events")
    op.drop_index("ix_maintenance_requests_status", table_name="maintenance_requests")
    op.drop_table("maintenance_requests")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    op.drop_index("ix_protected_objects_code", table_name="protected_objects")
    op.drop_table("protected_objects")
    op.drop_index("ix_equipment_types_name", "equipment_types")
    op.drop_table("equipment_types")

    if is_pg:
        op.execute("DROP TYPE IF EXISTS request_status")
        op.execute("DROP TYPE IF EXISTS user_role")
