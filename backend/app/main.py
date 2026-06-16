from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import settings

app = FastAPI(title=settings.app_name)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
if "*" in origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/health")
def health():
    return {"status": "ok"}


static_dir = Path(__file__).resolve().parent.parent / "static"
if static_dir.is_dir():
    @app.get("/")
    def spa_index():
        return FileResponse(static_dir / "index.html")

    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

