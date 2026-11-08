from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db import get_async_session
from repositories.cart import CartRepository
from repositories.product import ProductRepository
from services.cart import CartService
from schemas.cart import CartRead, CartItemBase
from api.deps import get_current_user_id

router = APIRouter(prefix="/cart", tags=["Cart"])


def get_cart_service(db: AsyncSession = Depends(get_async_session)):
    return CartService(CartRepository(db))


@router.get("/", response_model=CartRead)
async def get_cart(service: CartService = Depends(get_cart_service), user_id: int = Depends(get_current_user_id)):
    return await service.get_cart(user_id)


@router.post("/add", response_model=CartRead)
async def add_item(
    item: CartItemBase,
    service: CartService = Depends(get_cart_service),
    db: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user_id),
):
    if item.quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")
    if not await ProductRepository(db).get(item.product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    cart = await service.get_cart(user_id)
    await service.add_item(cart, item.product_id, item.quantity)
    return await service.get_cart(user_id)


@router.post("/remove", response_model=CartRead)
async def remove_item(item: CartItemBase, service: CartService = Depends(get_cart_service), user_id: int = Depends(get_current_user_id)):
    cart = await service.get_cart(user_id)
    await service.remove_item(cart, item.product_id)
    return await service.get_cart(user_id)


@router.post("/update", response_model=CartRead)
async def update_quantity(item: CartItemBase, service: CartService = Depends(get_cart_service), user_id: int = Depends(get_current_user_id)):
    cart = await service.get_cart(user_id)
    await service.update_quantity(cart, item.product_id, item.quantity)
    return await service.get_cart(user_id)


@router.post("/clear", response_model=CartRead)
async def clear_cart(service: CartService = Depends(get_cart_service), user_id: int = Depends(get_current_user_id)):
    cart = await service.get_cart(user_id)
    await service.clear_cart(cart)
    return await service.get_cart(user_id)
