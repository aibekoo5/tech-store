from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_current_admin
from db import get_async_session
from models.cart import CartItem
from models.favorite import Favorite
from models.order import OrderItem
from repositories.product import ProductRepository
from schemas.product import ProductRead, ProductCreate, ProductUpdate
from services.product import ProductService


def get_product_service(db: AsyncSession = Depends(get_async_session)):
    return ProductService(ProductRepository(db))


router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=List[ProductRead])
async def list_products(service: ProductService = Depends(get_product_service)):
    return await service.list_products()


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(product_id: int, service: ProductService = Depends(get_product_service)):
    product = await service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# ---- admin only ----

@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(get_current_admin)])
async def create_product(product: ProductCreate, service: ProductService = Depends(get_product_service)):
    return await service.create_product(product)


@router.put("/{product_id}", response_model=ProductRead, dependencies=[Depends(get_current_admin)])
async def update_product(product_id: int, update: ProductUpdate, service: ProductService = Depends(get_product_service)):
    updated = await service.update_product(product_id, update.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
async def delete_product(product_id: int, db: AsyncSession = Depends(get_async_session),
                         service: ProductService = Depends(get_product_service)):
    if not await service.get_product(product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    # Products that were ordered must stay for order history
    ordered = (await db.execute(select(func.count(OrderItem.id)).where(OrderItem.product_id == product_id))).scalar_one()
    if ordered:
        raise HTTPException(status_code=409, detail="Product has orders and cannot be deleted. Set stock to 0 instead")
    await db.execute(delete(CartItem).where(CartItem.product_id == product_id))
    await db.execute(delete(Favorite).where(Favorite.product_id == product_id))
    await service.delete_product(product_id)
