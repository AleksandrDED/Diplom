#!/bin/bash
set -e

alembic upgrade head
python -m app.scripts.seed_directories

if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  python -m app.scripts.create_admin \
    --email "$ADMIN_EMAIL" \
    --password "$ADMIN_PASSWORD" \
    --full-name "${ADMIN_FULL_NAME:-Администратор}" || true
fi

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
