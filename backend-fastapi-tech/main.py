import os
import ast
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import json
from pathlib import Path
from sqlalchemy import select, func, text

from db import async_engine, AsyncSessionLocal
from models import Base, Product
from api import product_router, user_router, cart_router, payment_router, order_router, favorite_router


SEED_FILE = Path(__file__).parent / "seed_products.json"

UPGRADE_SQL = [
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price DOUBLE PRECISION",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100)",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS badge VARCHAR(50)",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS rating DOUBLE PRECISION DEFAULT 0",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS reviews INTEGER DEFAULT 0",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS specs JSON",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT now()",
]


async def seed_products():
    """Fill the catalog from seed_products.json when the products table is empty."""
    async with AsyncSessionLocal() as session:
        has_products = (await session.execute(select(func.count(Product.id)))).scalar_one()
        if has_products or not SEED_FILE.exists():
            return
        for data in json.loads(SEED_FILE.read_text(encoding="utf-8")):
            session.add(Product(**data))
        await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # No alembic migrations exist yet, so create tables if missing
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Lightweight in-place upgrade for tables created by older versions of the models
        for stmt in UPGRADE_SQL:
            await conn.execute(text(stmt))
    await seed_products()
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


@app.get("/health")
async def health():
    return {"status": "ok"}
