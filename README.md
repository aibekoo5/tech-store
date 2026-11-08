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
- Администратор: **admin / admin123** → панель администратора http://localhost:8080/admin

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

> В продакшене задайте свой `SECRET_KEY` и `POSTGRES_PASSWORD`, выключите демо-аккаунты (`DEMO_USER_ENABLED=false`)
> и создайте своего администратора: `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

## Панель администратора — `/admin`

Доступна пользователям с ролью администратора (ссылка «Админка» появляется в шапке сайта).

| Раздел | Возможности |
|---|---|
| Обзор | выручка, число заказов / товаров / пользователей, заказы по статусам, товары с малым остатком |
| Товары | поиск, добавление, редактирование (цена, старая цена, остаток, категория, метка, фото, характеристики), удаление |
| Заказы | все заказы покупателей, смена статуса: В обработке → В пути → Доставлен / Отменён |
| Пользователи | список, число заказов, выдача и снятие прав администратора |

Товар, по которому уже есть заказы, удалить нельзя (история заказов сохраняется) — поставьте остаток 0.
Создание/изменение/удаление товаров и все `/admin/*` эндпоинты требуют прав администратора (иначе 401/403).

## Демо-данные

При старте бэкенд автоматически:
- добавляет в каталог товары из `backend-fastapi-tech/seed_products.json`, которые ещё не импортировались
  (импортированные запоминаются в таблице `seeded_products`, поэтому удалённый в админке товар не вернётся).
  Чтобы новый товар появился у всех — добавьте его в этот файл и перезапустите бэкенд (в Docker: `docker compose up --build`);
- создаёт демо-пользователя `demo` / `demo123` и администратора `admin` / `admin123`, если их ещё нет.
  Настраивается переменными `DEMO_USER_ENABLED`, `DEMO_USERNAME`, `DEMO_PASSWORD`, `DEMO_EMAIL`.

Реальные данные (пользователи, заказы) в репозиторий не попадают — у каждого своя база.

## Запуск локально без Docker

> ⚠️ Не запускайте одновременно Docker и локальные серверы: оба используют порты 8000 и 8080.
> Сначала `docker compose down`, потом `uvicorn` / `npm run dev` (и наоборот).

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
| POST/PUT/DELETE | `/products/`, `/products/{id}` | управление товарами (админ) |
| GET/PATCH | `/admin/stats`, `/admin/orders/{id}`, `/admin/users/{id}` | статистика, статусы заказов, роли (админ) |
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
