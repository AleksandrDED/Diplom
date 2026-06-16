## Веб‑сервис заявок на ТО систем охраны

Проект для ВКР: **формирование и учёт заявок на техническое обслуживание (ТО) ТСО**.

### Стек
- **Backend**: FastAPI + SQLAlchemy + Alembic + JWT (RBAC)
- **DB**: PostgreSQL (через Docker) или SQLite (dev по умолчанию)
- **Frontend**: React (Vite) + MUI

### Быстрый старт (SQLite)
Открой 2 терминала.

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python -m app
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Открой:
- API docs: `http://127.0.0.1:8000/docs`
- UI: `http://127.0.0.1:5173`

### Старт с PostgreSQL (Docker, только API)

```bash
docker compose up -d --build
```

Backend внутри контейнера сам применит миграции. Фронтенд запускайте отдельно (`npm run dev`).

### Развёртывание на Render (GitHub → облако)

Рекомендуется для защиты: бесплатный HTTPS, без настройки VPS.

1. Залейте проект на **GitHub**
2. Подключите репозиторий в **[Render](https://render.com)**
3. Используйте файл `render.yaml` (Blueprint) или настройте вручную

Подробная инструкция: **[DEPLOY-RENDER.md](DEPLOY-RENDER.md)**

### Развёртывание на VPS (альтернатива)

API + интерфейс + PostgreSQL в одном `docker compose`:

```bash
cp deploy/.env.production.example .env
# отредактируйте .env
docker compose -f docker-compose.prod.yml up -d --build
```

Подробная инструкция: **[DEPLOY.md](DEPLOY.md)**

### Справочники (объекты и типы ТСО)
После миграций заполни тестовые данные для выпадающих списков при создании заявки:

```bash
cd backend
.venv\Scripts\activate
python -m app.scripts.seed_directories
```

Или добавь объекты и типы ТСО вручную через раздел «Справочники» в UI.

### Учётные записи
После первого запуска создай администратора:

```bash
cd backend
.venv\Scripts\activate
python -m app.scripts.create_admin --email admin@example.com --password Admin12345!
```

Роли:
- `admin` — справочники/пользователи/всё
- `manager` — контроль и отчёты
- `engineer` — исполнение заявок
- `requester` — создание и просмотр своих заявок

