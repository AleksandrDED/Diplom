from __future__ import annotations

from fastapi import APIRouter

from app.api.routers import auth, directories, reports, requests, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(directories.router)
api_router.include_router(requests.router)
api_router.include_router(reports.router)

