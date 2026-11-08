# ArzanAll — интернет-магазин электроники

Полноценный магазин: каталог, корзина, избранное, оформление заказов, авторизация по JWT.
Интерфейс на трёх языках: русский, қазақша, English.

| Часть | Папка | Стек |
|---|---|---|
| Frontend | `frontend-react-tech/` | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query |
| Backend | `backend-fastapi-tech/` | FastAPI, async SQLAlchemy 2, PostgreSQL (asyncpg), JWT, Stripe |

## Быстрый старт (Docker)

Нужен только [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```sh
docker compose up --build
```

- Сайт: http://localhost:8080
- API и документация: http://localhost:8000/docs
- Демо-аккаунт: **demo / demo123** (кнопка «Войти в демо-аккаунт» на странице входа)

PostgreSQL, бэкенд и фронтенд поднимаются автоматически; таблицы, каталог и демо-пользователь
создаются при первом запуске. Данные хранятся в Docker-томе `db-data` и не пропадают между перезапусками.

| Команда | Что делает |
|---|---|
| `docker compose up -d --build` | запустить в фоне |
| `docker compose logs -f backend` | логи бэкенда |
| `docker compose down` | остановить (данные сохраняются) |
| `docker compose down -v` | остановить и **удалить** базу (при следующем запуске — снова чистый каталог и демо-аккаунт) |

Порты, пароль БД, `SECRET_KEY` и ключи Stripe можно переопределить: скопируйте
`.env.docker.example` в `.env` в корне проекта.

> В продакшене задайте свой `SECRET_KEY` и `POSTGRES_PASSWORD` и выключите демо-аккаунт: `DEMO_USER_ENABLED=false`.

## Демо-данные

При старте бэкенд автоматически:
- добавляет в каталог товары из `backend-fastapi-tech/seed_products.json`, которых ещё нет в базе (сравнение по названию).
  Чтобы новый товар появился у всех — добавьте его в этот файл и перезапустите бэкенд (в Docker: `docker compose up --build`);
- создаёт демо-пользователя `demo` / `demo123` (`demo@arzanall.kz`), если его ещё нет.
  Настраивается переменными `DEMO_USER_ENABLED`, `DEMO_USERNAME`, `DEMO_PASSWORD`, `DEMO_EMAIL`.

Реальные данные (пользователи, заказы) в репозиторий не попадают — у каждого своя база.

## Запуск локально без Docker

Нужны: Python 3.11, Node.js 18+, PostgreSQL 16.

### 1. База данных

Создайте базу `tech` в PostgreSQL. Таблицы, каталог (`seed_products.json`) и демо-пользователь
создаются автоматически при запуске бэкенда.

### 2. Backend — http://localhost:8000 (документация: `/docs`)

```sh
cd backend-fastapi-tech
python -m venv .venv
.venv\Scripts\activate          # Windows  (Linux/macOS: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env          # укажите пароль PostgreSQL и SECRET_KEY
uvicorn main:app --reload --port 8000
```

### 3. Frontend — http://localhost:8080

```sh
cd frontend-react-tech
npm install
npm run dev
```

Vite проксирует запросы `/api/*` на `http://localhost:8000`
(другой адрес бэкенда: переменная `VITE_BACKEND_URL`).

## API

| Метод | Путь | Описание |
|---|---|---|
| POST | `/users/register`, `/users/login` | регистрация, вход (JWT) |
| GET | `/users/me` | текущий пользователь |
| GET | `/products/`, `/products/{id}` | каталог |
| GET/POST | `/cart/`, `/cart/add`, `/cart/update`, `/cart/remove`, `/cart/clear` | корзина |
| GET/POST/DELETE | `/favorites/`, `/favorites/{product_id}` | избранное |
| GET/POST | `/orders/`, `/orders/checkout` | заказы (сумма считается на сервере) |
| POST | `/payments/create-intent`, `/payments/webhook` | Stripe |

Эндпоинты корзины, избранного, заказов и платежей требуют заголовок `Authorization: Bearer <token>`.

## Структура бэкенда

```
backend-fastapi-tech/
├── main.py              # приложение, CORS, создание таблиц, сид каталога
├── db.py                # подключение к БД, загрузка .env
├── api/                 # роутеры (users, products, cart, favorites, orders, payments)
├── models/              # модели SQLAlchemy
├── schemas/             # схемы Pydantic
├── repositories/        # доступ к данным
├── services/            # бизнес-логика
└── seed_products.json   # стартовый каталог
```
