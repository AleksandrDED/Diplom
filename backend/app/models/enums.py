from __future__ import annotations

import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    engineer = "engineer"
    requester = "requester"


class RequestStatus(str, enum.Enum):
    new = "new"
    assigned = "assigned"
    in_progress = "in_progress"
    waiting = "waiting"
    done = "done"
    cancelled = "cancelled"

