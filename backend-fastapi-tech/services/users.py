from datetime import timedelta

from fastapi import HTTPException, status

from schemas.users import TokenResponse, UserCreate, UserLogin, UserRead
from utils.config import get_settings
from utils.security import create_access_token, hash_password, verify_password
from utils.unitofwork import IUnitOfWork


class UsersService:
    async def register(self, uow: IUnitOfWork, payload: UserCreate) -> int:
        async with uow:
            existing = await uow.users.find_by_email(payload.email)
            if existing:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
            hashed = hash_password(payload.password)
            user_data = payload.model_dump(exclude={"password"}) | {"hashed_password": hashed}
            user_id = await uow.users.add_one(user_data)
            await uow.commit()
            return user_id

    async def login(self, uow: IUnitOfWork, credentials: UserLogin) -> TokenResponse:
        async with uow:
            db_user = await uow.users.get_db_user(credentials.email)
            if not db_user or not verify_password(credentials.password, db_user.hashed_password):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

            settings = get_settings()
            expire = timedelta(minutes=settings.access_token_expire_minutes)
            token = create_access_token({"sub": str(db_user.id)}, expire)
            return TokenResponse(access_token=token)

    async def get_user(self, uow: IUnitOfWork, user_id: int) -> UserRead | None:
        async with uow:
            return await uow.users.find_one(id=user_id)
