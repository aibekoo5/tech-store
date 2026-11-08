from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.product import ProductRead, ProductCreate
from services.product import ProductService
from repositories.product import ProductRepository
from models.product import Product
from db import get_async_session
from typing import List

def get_product_service(db: AsyncSession = Depends(get_async_session)):
    repo = ProductRepository(db)
    return ProductService(repo)

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

@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate, service: ProductService = Depends(get_product_service)):
    return await service.create_product(product)

@router.put("/{product_id}", response_model=ProductRead)
async def update_product(product_id: int, update_data: dict, service: ProductService = Depends(get_product_service)):
    updated = await service.update_product(product_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, service: ProductService = Depends(get_product_service)):
    deleted = await service.delete_product(product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
