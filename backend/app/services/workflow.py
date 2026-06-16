from __future__ import annotations

from app.models.enums import RequestStatus, UserRole

# Явные правила переходов (единый источник истины)
ALLOWED_TRANSITIONS: dict[RequestStatus, set[RequestStatus]] = {
    RequestStatus.new: {RequestStatus.assigned, RequestStatus.cancelled},
    RequestStatus.assigned: {RequestStatus.in_progress, RequestStatus.waiting, RequestStatus.cancelled},
    RequestStatus.in_progress: {RequestStatus.waiting, RequestStatus.done, RequestStatus.cancelled},
    RequestStatus.waiting: {RequestStatus.in_progress, RequestStatus.done, RequestStatus.cancelled},
    RequestStatus.done: set(),
    RequestStatus.cancelled: set(),
}


def can_change_status(role: UserRole, from_status: RequestStatus, to_status: RequestStatus) -> bool:
    if to_status not in ALLOWED_TRANSITIONS.get(from_status, set()):
        return False
    if role in (UserRole.admin, UserRole.manager):
        return True
    if role == UserRole.engineer:
        return from_status in {RequestStatus.assigned, RequestStatus.in_progress, RequestStatus.waiting}
    if role == UserRole.requester:
        return from_status == RequestStatus.new and to_status == RequestStatus.cancelled
    return False

