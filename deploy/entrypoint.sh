#!/usr/bin/env bash
set -e

echo "Waiting for database..."
python - <<'PY'
import sys
import time

from sqlalchemy import create_engine, text

from app.core.config import settings

for attempt in range(1, 61):
    try:
        engine = create_engine(settings.database_url, pool_pre_ping=True)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Database is ready")
        sys.exit(0)
    except Exception as exc:
        print(f"Attempt {attempt}/60: {exc}")
        time.sleep(2)

print("Database not ready in time")
sys.exit(1)
PY

alembic upgrade head
python -m app.scripts.seed_directories

if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  python -m app.scripts.create_admin \
    --email "$ADMIN_EMAIL" \
    --password "$ADMIN_PASSWORD" \
    --full-name "${ADMIN_FULL_NAME:-Administrator}" || true
fi

echo "Starting server on port ${PORT:-8000}"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
