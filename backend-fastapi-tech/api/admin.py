from datetime import datetime
from typing import List, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from api.deps import get_current_admin
from db import get_async_session
from models.order import Order, OrderItem
from models.product import Product
from models.user import User
from schemas.order import OrderItemRead

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(get_current_admin)])

ORDER_STATUSES = ("Processing", "In Transit", "Delivered", "Cancelled")
LOW_STOCK = 5


# ---- schemas ----

class StatsRead(BaseModel):
    products: int
    users: int
    orders: int
    revenue: float
    low_stock: int
    orders_by_status: dict[str, int]


class AdminUserRead(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    created_at: datetime
    orders_count: int


class AdminOrderRead(BaseModel):
    id: int
    user_id: int
    username: str
    email: str
    total_price: float
    status: str
    created_at: datetime
    items: List[OrderItemRead]


class OrderStatusUpdate(BaseModel):
    status: Literal["Processing", "In Transit", "Delivered", "Cancelled"]


class UserRoleUpdate(BaseModel):
    is_admin: bool


# ---- endpoints ----

@router.get("/stats", response_model=StatsRead)
async def stats(db: AsyncSession = Depends(get_async_session)):
    count = lambda model: select(func.count()).select_from(model)  # noqa: E731
    by_status = dict((await db.execute(select(Order.status, func.count()).group_by(Order.status))).all())
    revenue = (await db.execute(
        select(func.coalesce(func.sum(Order.total_price), 0)).where(Order.status != "Cancelled")
    )).scalar_one()
    return StatsRead(
        products=(await db.execute(count(Product))).scalar_one(),
        users=(await db.execute(count(User))).scalar_one(),
        orders=(await db.execute(count(Order))).scalar_one(),
        revenue=round(float(revenue), 2),
        low_stock=(await db.execute(select(func.count()).where(Product.stock <= LOW_STOCK))).scalar_one(),
        orders_by_status={s: by_status.get(s, 0) for s in ORDER_STATUSES},
    )


def _to_admin_order(o: Order) -> AdminOrderRead:
    return AdminOrderRead(
        id=o.id, user_id=o.user_id, username=o.user.username, email=o.user.email,
        total_price=o.total_price, status=o.status, created_at=o.created_at,
        items=[OrderItemRead.model_validate(i) for i in o.items],
    )


def _orders_query():
    return select(Order).options(
        selectinload(Order.user),
        selectinload(Order.items).selectinload(OrderItem.product),
    )


@router.get("/orders", response_model=List[AdminOrderRead])
async def list_orders(db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(_orders_query().order_by(Order.created_at.desc()))
    return [_to_admin_order(o) for o in result.scalars().all()]


@router.patch("/orders/{order_id}", response_model=AdminOrderRead)
async def update_order_status(order_id: int, body: OrderStatusUpdate, db: AsyncSession = Depends(get_async_session)):
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = body.status
    await db.commit()
    result = await db.execute(_orders_query().where(Order.id == order_id).execution_options(populate_existing=True))
    return _to_admin_order(result.scalars().one())


@router.get("/users", response_model=List[AdminUserRead])
async def list_users(db: AsyncSession = Depends(get_async_session)):
    rows = await db.execute(
        select(User, func.count(Order.id))
        .outerjoin(Order, Order.user_id == User.id)
        .group_by(User.id)
        .order_by(User.id)
    )
    return [
        AdminUserRead(id=u.id, username=u.username, email=u.email, is_admin=u.is_admin,
                      created_at=u.created_at, orders_count=n)
        for u, n in rows.all()
    ]


@router.patch("/users/{user_id}", response_model=AdminUserRead)
async def update_user_role(user_id: int, body: UserRoleUpdate, db: AsyncSession = Depends(get_async_session),
                           admin: User = Depends(get_current_admin)):
    if user_id == admin.id and not body.is_admin:
        raise HTTPException(status_code=400, detail="You cannot remove your own admin rights")
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_admin = body.is_admin
    await db.commit()
    orders_count = (await db.execute(select(func.count(Order.id)).where(Order.user_id == user_id))).scalar_one()
    return AdminUserRead(id=user.id, username=user.username, email=user.email, is_admin=user.is_admin,
                         created_at=user.created_at, orders_count=orders_count)
