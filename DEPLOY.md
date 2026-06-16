# Развёртывание на облачном сервере (VPS)

Один контейнер отдаёт **и API, и веб-интерфейс** на порту 80.  
База данных — PostgreSQL в Docker.

## Что понадобится

- VPS с **Ubuntu 22.04 / 24.04** (Timeweb, Selectel, Aeza, REG.RU и т.п.)
- Минимум: **1 GB RAM**, **1 vCPU**, **10 GB** диск
- Открытый порт **80** (и **443**, если будет HTTPS)

## Шаг 1. Аренда сервера

1. Создайте VPS с Ubuntu.
2. Запомните **IP-адрес** сервера (например `123.45.67.89`).
3. В панели хостинга откройте **порт 80** в firewall / security group.

## Шаг 2. Подключение по SSH

```bash
ssh root@123.45.67.89
```

(или `ssh ubuntu@...` — как выдал хостинг)

## Шаг 3. Установка Docker на сервере

```bash
apt update && apt install -y git curl
curl -fsSL https://get.docker.com | sh
```

Проверка:

```bash
docker --version
docker compose version
```

## Шаг 4. Загрузка проекта на сервер

**Вариант A — через Git (если проект в репозитории):**

```bash
cd /opt
git clone <URL-ВАШЕГО-РЕПОЗИТОРИЯ> diplom
cd diplom
```

**Вариант B — архив с компьютера (без Git):**

На своём ПК (PowerShell):

```powershell
cd d:\diplom
tar -czf diplom.tar.gz --exclude=backend\.venv --exclude=frontend\node_modules --exclude=backend\app.db .
scp diplom.tar.gz root@123.45.67.89:/opt/
```

На сервере:

```bash
cd /opt
mkdir diplom && tar -xzf diplom.tar.gz -C diplom
cd diplom
```

## Шаг 5. Настройка переменных окружения

```bash
cp deploy/.env.production.example .env
nano .env
```

Обязательно измените:

```env
POSTGRES_PASSWORD=ваш-сложный-пароль
JWT_SECRET_KEY=случайная-строка-32-символа-и-больше
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin12345!
```

Сохраните: `Ctrl+O`, Enter, `Ctrl+X`.

## Шаг 6. Запуск

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Первый запуск займёт **3–10 минут** (сборка образа).

Проверка логов:

```bash
docker compose -f docker-compose.prod.yml logs -f app
```

Дождитесь строки `Application startup complete`.

## Шаг 7. Открыть в браузере

- **Интерфейс:** `http://123.45.67.89`
- **API docs:** `http://123.45.67.89/docs`
- **Health:** `http://123.45.67.89/health`

Вход: email и пароль из `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

При первом запуске автоматически:
- применяются миграции БД;
- заполняются справочники (объекты и типы ТСО);
- создаётся администратор.

---

## Полезные команды

```bash
# Статус контейнеров
docker compose -f docker-compose.prod.yml ps

# Перезапуск после изменений
docker compose -f docker-compose.prod.yml up -d --build

# Остановить
docker compose -f docker-compose.prod.yml down

# Логи
docker compose -f docker-compose.prod.yml logs -f
```

---

## HTTPS (по желанию, если есть домен)

1. Привяжите домен к IP сервера (A-запись).
2. Установите Caddy или Nginx + Certbot.
3. Проксируйте на `localhost:80` или смените `APP_PORT`.

Для защиты «на завтра» достаточно **http://IP** — на защите это нормально.

---

## Если что-то не работает

| Проблема | Решение |
|----------|---------|
| Сайт не открывается | Проверьте firewall, порт 80, `docker compose ps` |
| 502 / пустая страница | `docker compose logs app`, дождитесь сборки |
| Не входит в систему | Проверьте `ADMIN_EMAIL` / `ADMIN_PASSWORD` в `.env` |
| Пустые списки в заявках | Справочники создаются при старте; перезапустите: `docker compose ... restart app` |

---

## Обновление после правок в коде

```bash
cd /opt/diplom
# загрузите новые файлы (git pull или scp)
docker compose -f docker-compose.prod.yml up -d --build
```
