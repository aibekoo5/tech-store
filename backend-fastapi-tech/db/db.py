from typing import AsyncGenerator

from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from backend.utils.config import get_settings

settings = get_settings()
DATABASE_URL = settings.database_url
Base = declarative_base()
metadata = MetaData()

engine = create_async_engine(
    DATABASE_URL,
    future=True,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
)
async_session_maker = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
