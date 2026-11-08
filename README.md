# ArzanAll — интернет-магазин электроники

Полноценный магазин: каталог, корзина, избранное, оформление заказов, авторизация по JWT.
Интерфейс на трёх языках: русский, қазақша, English.

| Часть | Папка | Стек |
|---|---|---|
| Frontend | `frontend-react-tech/` | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query |
| Backend | `backend-fastapi-tech/` | FastAPI, async SQLAlchemy 2, PostgreSQL (asyncpg), JWT, Stripe |

## Запуск локально

Нужны: Python 3.11, Node.js 18+, PostgreSQL 16.

### 1. База данных

Создайте базу `tech` в PostgreSQL. Таблицы создаются и каталог заполняется
(`seed_products.json`) автоматически при первом запуске бэкенда.

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
