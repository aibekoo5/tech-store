from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from db import get_async_session
from models.order import Order, OrderItem
from repositories.cart import CartRepository
from schemas.order import OrderRead
from api.deps import get_current_user_id

router = APIRouter(prefix="/orders", tags=["Orders"])

# Same rules as the frontend cart summary
FREE_SHIPPING_FROM = 50
SHIPPING = 9.99
TAX_RATE = 0.08


def _orders_query():
    return select(Order).options(selectinload(Order.items).selectinload(OrderItem.product))


@router.get("/", response_model=List[OrderRead])
async def list_orders(db: AsyncSession = Depends(get_async_session), user_id: int = Depends(get_current_user_id)):
    result = await db.execute(
        _orders_query().where(Order.user_id == user_id).order_by(Order.created_at.desc())
    )
    return result.scalars().all()


@router.post("/checkout", response_model=OrderRead, status_code=201)
async def checkout(db: AsyncSession = Depends(get_async_session), user_id: int = Depends(get_current_user_id)):
    """Creates an order from the user's cart (prices computed server-side) and empties the cart."""
    cart = await CartRepository(db).get_cart_by_user_id(user_id)
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    subtotal = sum(i.product.price * i.quantity for i in cart.items)
    shipping = 0 if subtotal > FREE_SHIPPING_FROM else SHIPPING
    total = round(subtotal + shipping + subtotal * TAX_RATE, 2)

    order = Order(
        user_id=user_id,
        total_price=total,
        status="Processing",
        items=[OrderItem(product_id=i.product_id, quantity=i.quantity, price=i.product.price) for i in cart.items],
    )
    db.add(order)
    for item in list(cart.items):
        await db.delete(item)
    await db.commit()

    result = await db.execute(_orders_query().where(Order.id == order.id).execution_options(populate_existing=True))
    return result.scalars().one()
