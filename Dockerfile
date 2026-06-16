# --- Frontend build ---
FROM node:20-alpine AS frontend
WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

COPY frontend/ ./
ENV VITE_API_BASE=/api/v1
RUN npm run build

# --- Backend runtime ---
FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY backend/alembic.ini /app/alembic.ini
COPY backend/alembic /app/alembic
COPY backend/app /app/app

COPY --from=frontend /frontend/dist /app/static

COPY deploy/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

CMD ["/app/entrypoint.sh"]
