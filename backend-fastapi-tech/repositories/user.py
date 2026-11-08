from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlalchemy.future import select
from models.user import User
from schemas.user import UserCreate
from typing import Optional, List
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    async def get_by_username(self, username: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalars().first()

    async def create_user(self, create_data: UserCreate) -> User:
        hashed_password = pwd_context.hash(create_data.password)
        user = User(
            username=create_data.username,
            email=create_data.email,
            hashed_password=hashed_password
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def get_by_login(self, login: str) -> Optional[User]:
        """Find a user by username or email (email is case-insensitive)."""
        login = login.strip()
        result = await self.db.execute(
            select(User).where((User.username == login) | (func.lower(User.email) == login.lower()))
        )
        return result.scalars().first()

    async def verify_user(self, username: str, password: str) -> Optional[User]:
        user = await self.get_by_login(username)
        if user and pwd_context.verify(password, user.hashed_password):
            return user
        return None

    async def list_users(self) -> List[User]:
        result = await self.db.execute(select(User))
        return result.scalars().all()

