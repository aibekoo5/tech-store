import os
from datetime import datetime, timedelta
from jose import jwt

from repositories.user import UserRepository
from schemas.user import UserCreate
from models.user import User
from typing import Optional, List

SECRET_KEY = os.environ.get('SECRET_KEY')
ALGORITHM = os.environ.get('ALGORITHM')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', 30))

class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    async def register_user(self, user_create: UserCreate) -> User:
        return await self.repo.create_user(user_create)

    async def authenticate_user(self, username: str, password: str) -> Optional[User]:
        return await self.repo.verify_user(username, password)

    async def get_user(self, user_id: int) -> Optional[User]:
        return await self.repo.get_by_id(user_id)

    async def get_users(self) -> List[User]:
        return await self.repo.list_users()

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

