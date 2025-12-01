from fastapi import APIRouter, Depends

from backend.api.dependencies import UOWDep, get_current_user
from backend.schemas.orders import OrderCreate, OrderRead
from backend.schemas.users import UserRead
from backend.services.orders import OrdersService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=list[OrderRead])
async def list_orders(uow: UOWDep, current_user: UserRead = Depends(get_current_user)):
    return await OrdersService().list_orders(uow, current_user.id)


@router.post("", response_model=dict)
async def create_order(
    payload: OrderCreate,
    uow: UOWDep,
    current_user: UserRead = Depends(get_current_user),
):
    order_id = await OrdersService().create_order(uow, current_user.id, payload)
    return {"order_id": order_id}
