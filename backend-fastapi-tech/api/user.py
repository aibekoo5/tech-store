from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from schemas.user import UserCreate, UserRead, UserLogin
from services.user import UserService
from repositories.user import UserRepository
from models.user import User
from db import get_async_session
from api.deps import get_current_user_id

router = APIRouter(prefix="/users", tags=["Users"])


def get_user_service(db: AsyncSession = Depends(get_async_session)):
    return UserService(UserRepository(db))


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_async_session),
                        service: UserService = Depends(get_user_service)):
    exists = await db.execute(select(User).where(or_(User.username == user.username, User.email == user.email)))
    if exists.scalars().first():
        raise HTTPException(status_code=400, detail="Username or email already registered")
    return await service.register_user(user)


@router.post("/login")
async def login(form: UserLogin, service: UserService = Depends(get_user_service)):
    user = await service.authenticate_user(form.username, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = service.create_access_token({"sub": user.username, "id": user.id})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserRead)
async def me(user_id: int = Depends(get_current_user_id), service: UserService = Depends(get_user_service)):
    user = await service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: int, service: UserService = Depends(get_user_service)):
    user = await service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
