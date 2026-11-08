import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

# Load .env before reading DATABASE_URL (this module is imported before main.py calls load_dotenv)
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set (check full-tech/.env)")

async_engine = create_async_engine(DATABASE_URL, echo=os.environ.get('DEBUG', 'False') == 'True')
AsyncSessionLocal = async_sessionmaker(async_engine, expire_on_commit=False, class_=AsyncSession)


async def get_async_session():
    """FastAPI dependency: yields a session (must be a plain async generator, not a context manager)."""
    async with AsyncSessionLocal() as session:
        yield session
