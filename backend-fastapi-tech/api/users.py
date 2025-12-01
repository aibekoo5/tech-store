from fastapi import APIRouter, Depends

from backend.api.dependencies import UOWDep, get_current_user
from backend.schemas.users import TokenResponse, UserCreate, UserLogin, UserRead
from backend.services.users import UsersService

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register", response_model=dict)
async def register_user(payload: UserCreate, uow: UOWDep):
    user_id = await UsersService().register(uow, payload)
    return {"user_id": user_id}


@router.post("/login", response_model=TokenResponse)
async def login_user(credentials: UserLogin, uow: UOWDep):
    return await UsersService().login(uow, credentials)


@router.get("/me", response_model=UserRead)
async def get_profile(current_user: UserRead = Depends(get_current_user)):
    return current_user
