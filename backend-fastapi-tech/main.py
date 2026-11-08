import os
import ast
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import json
from pathlib import Path
from sqlalchemy import select, text

from db import async_engine, AsyncSessionLocal
from models import Base, Product, User, SeededProduct
from repositories.user import pwd_context
from api import product_router, user_router, cart_router, payment_router, order_router, favorite_router, admin_router


SEED_FILE = Path(__file__).parent / "seed_products.json"

UPGRADE_SQL = [
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price DOUBLE PRECISION",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100)",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS badge VARCHAR(50)",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS rating DOUBLE PRECISION DEFAULT 0",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS reviews INTEGER DEFAULT 0",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS specs JSON",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT now()",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT now()",
]


async def seed_products():
    """Import products from seed_products.json that were never imported before.
    Imported names are remembered in `seeded_products`, so products an admin deletes
    or renames do not come back on the next start. Safe to run on every start."""
    if not SEED_FILE.exists():
        return
    async with AsyncSessionLocal() as session:
        seeded = set((await session.execute(select(SeededProduct.name))).scalars().all())
        if not seeded:
            # First run with this logic: products already in the DB count as imported
            existing = set((await session.execute(select(Product.name))).scalars().all())
            session.add_all(SeededProduct(name=n) for n in existing)
            seeded = existing
        for data in json.loads(SEED_FILE.read_text(encoding="utf-8")):
            if data["name"] not in seeded:
                session.add(Product(**data))
                session.add(SeededProduct(name=data["name"]))
                seeded.add(data["name"])
        await session.commit()


def _enabled(var: str, default: str = "true") -> bool:
    return os.environ.get(var, default).lower() in ("1", "true", "yes")


async def ensure_user(username: str, email: str, password: str, is_admin: bool = False):
    """Create the account if neither username nor email is taken; promote to admin if requested."""
    async with AsyncSessionLocal() as session:
        user = (await session.execute(
            select(User).where((User.username == username) | (User.email == email))
        )).scalars().first()
        if user is None:
            session.add(User(username=username, email=email,
                             hashed_password=pwd_context.hash(password), is_admin=is_admin))
        elif is_admin and not user.is_admin:
            user.is_admin = True
        await session.commit()


async def seed_accounts():
    """Demo accounts for local/dev use (DEMO_USER_ENABLED, default true):
         demo / demo123   - regular customer
         admin / admin123 - administrator
       Production administrator: set ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD."""
    if _enabled("DEMO_USER_ENABLED"):
        await ensure_user(os.environ.get("DEMO_USERNAME", "demo"),
                          os.environ.get("DEMO_EMAIL", "demo@arzanall.kz"),
                          os.environ.get("DEMO_PASSWORD", "demo123"))
        await ensure_user("admin", "admin@arzanall.kz", "admin123", is_admin=True)
    admin_name, admin_password = os.environ.get("ADMIN_USERNAME"), os.environ.get("ADMIN_PASSWORD")
    if admin_name and admin_password:
        await ensure_user(admin_name, os.environ.get("ADMIN_EMAIL", f"{admin_name}@arzanall.kz"),
                          admin_password, is_admin=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # No alembic migrations exist yet, so create tables if missing
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Lightweight in-place upgrade for tables created by older versions of the models
        for stmt in UPGRADE_SQL:
            await conn.execute(text(stmt))
    await seed_products()
    await seed_accounts()
    yield
    await async_engine.dispose()


app = FastAPI(title=os.environ.get('PROJECT_NAME', 'ArzanAll Online Store API'), lifespan=lifespan)

origins = os.environ.get('BACKEND_CORS_ORIGINS')
if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ast.literal_eval(origins),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(product_router)
app.include_router(user_router)
app.include_router(cart_router)
app.include_router(payment_router)
app.include_router(order_router)
app.include_router(favorite_router)
app.include_router(admin_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
