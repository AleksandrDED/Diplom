# Деплой на Render через GitHub

Render подключается к репозиторию на GitHub, собирает Docker-образ и запускает **сайт + API + PostgreSQL** в облаке.

Итоговый адрес будет вида: `https://diplom-tco.onrender.com`

---

## Шаг 1. Залить проект на GitHub

### 1.1. Создайте репозиторий на GitHub

1. Откройте [github.com/new](https://github.com/new)
2. Имя, например: `diplom-tco`
3. **Private** или **Public** — на ваш выбор
4. **Не** добавляйте README, .gitignore, license (они уже есть в проекте)
5. Нажмите **Create repository**

### 1.2. Загрузите код с компьютера

В PowerShell на своём ПК:

```powershell
cd d:\diplom

git init
git add .
git commit -m "Initial commit: web service TCO maintenance"

git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/diplom-tco.git
git push -u origin main
```

> Если `git` не установлен: [git-scm.com/download/win](https://git-scm.com/download/win)

При `git push` GitHub попросит войти (логин + токен или браузер).

**Важно:** в репозиторий **не попадут** `.env`, `node_modules`, `.venv`, `app.db` — они в `.gitignore`.

---

## Шаг 2. Регистрация на Render

1. Откройте [render.com](https://render.com)
2. **Get Started** → войдите через **GitHub**
3. Разрешите Render доступ к репозиториям

---

## Шаг 3. Создание сервиса (Blueprint)

### Вариант A — автоматически (рекомендуется)

В проекте уже есть файл `render.yaml`.

1. Render Dashboard → **New** → **Blueprint**
2. Подключите репозиторий `diplom-tco`
3. Render увидит `render.yaml` и предложит создать:
   - **Web Service** `diplom-tco` (Docker)
   - **PostgreSQL** `guard-db`
4. Перед деплоем задайте секрет:
   - `ADMIN_PASSWORD` — придумайте пароль (например `Admin12345!`)
5. Нажмите **Apply**

### Вариант B — вручную

**База данных:**

1. **New** → **PostgreSQL**
2. Name: `guard-db`, Plan: **Free**
3. Create → скопируйте **Internal Database URL**

**Web Service:**

1. **New** → **Web Service**
2. Connect repository → выберите `diplom-tco`
3. Настройки:
   - **Language:** Docker
   - **Dockerfile Path:** `./Dockerfile`
   - **Plan:** Free
4. **Environment Variables:**

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Internal Database URL из PostgreSQL |
| `JWT_SECRET_KEY` | случайная строка 32+ символов |
| `ADMIN_EMAIL` | `admin@example.com` |
| `ADMIN_PASSWORD` | ваш пароль |
| `CORS_ORIGINS` | `*` |

5. **Create Web Service**

---

## Шаг 4. Дождаться деплоя

1. Вкладка **Logs** — сборка 5–15 минут (первый раз дольше)
2. Статус **Live** — сервис запущен
3. Откройте URL сверху, например: `https://diplom-tco.onrender.com`

Проверки:

- Сайт: `https://ваш-сервис.onrender.com`
- API docs: `https://ваш-сервис.onrender.com/docs`
- Health: `https://ваш-сервис.onrender.com/health`

**Вход:** `admin@example.com` + пароль из `ADMIN_PASSWORD`

При первом запуске автоматически:
- миграции БД;
- тестовые справочники;
- учётка администратора.

---

## Шаг 5. Обновление после правок

```powershell
cd d:\diplom
git add .
git commit -m "Описание изменений"
git push
```

Render **сам пересоберёт** сервис после push в `main`.

---

## Особенности бесплатного Render

| Момент | Что знать |
|--------|-----------|
| **Засыпание** | После ~15 мин без посещений сервис «засыпает» |
| **Первый заход** | Может грузиться **30–60 секунд** — прогрейте до защиты |
| **PostgreSQL Free** | Ограничения по объёму; для диплома обычно хватает |
| **HTTPS** | Выдаётся автоматически, порт 80/443 настраивать не нужно |

**Совет на защиту:** за 5 минут до показа откройте сайт и дождитесь загрузки.

---

## Если деплой падает с «Exited with status 1»

1. Откройте **diplom-tco** → **Logs** (не Events) — там текст ошибки.
2. Если база уже создавалась с ошибкой, **сбросьте PostgreSQL**:
   - Render → **guard-db** → **Settings** → **Delete Database**
   - Затем **Blueprint Diplom** → **Manual sync** (база создастся заново)
3. **diplom-tco** → **Manual Deploy** → **Clear build cache & deploy**

Частая причина: миграция под SQLite не подходила для PostgreSQL — в последних коммитах исправлено.

---

| Проблема | Решение |
|----------|---------|
| Build failed | Смотрите **Logs** → часто опечатка в env или ошибка Docker |
| 502 / Application failed | Проверьте `DATABASE_URL`, логи при старте |
| Пустые списки в заявках | Перезапустите: **Manual Deploy** → **Deploy latest commit** |
| Не входит | Проверьте `ADMIN_PASSWORD` в Environment |

---

## GitHub + Render — схема

```
Ваш ПК  →  git push  →  GitHub  →  Render (auto deploy)  →  https://....onrender.com
                              ↘
                           PostgreSQL (Render)
```

---

## Локальная разработка (как раньше)

Render не мешает локальному запуску:

```powershell
# backend + frontend локально — см. README.md
```

Файлы `docker-compose.prod.yml` и `DEPLOY.md` — для VPS, если понадобится альтернатива.
