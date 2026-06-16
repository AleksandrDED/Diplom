from __future__ import annotations

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://") and "+psycopg" not in url:
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "Guard Maintenance Requests"
    api_v1_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    database_url: str = "sqlite:///./app.db"

    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    jwt_access_token_minutes: int = 60 * 8

    @model_validator(mode="after")
    def _normalize_database_url(self) -> "Settings":
        self.database_url = normalize_database_url(self.database_url)
        return self


settings = Settings()

