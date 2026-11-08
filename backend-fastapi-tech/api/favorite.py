from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from db import get_async_session
from models.favorite import Favorite
from repositories.product import ProductRepository
from schemas.product import ProductRead
from api.deps import get_current_user_id

router = APIRouter(prefix="/favorites", tags=["Favorites"])


async def _list(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(Favorite)
        .options(selectinload(Favorite.product))
        .where(Favorite.user_id == user_id)
        .order_by(Favorite.created_at.desc())
    )
    return [f.product for f in result.scalars().all()]


async def _get(db: AsyncSession, user_id: int, product_id: int):
    result = await db.execute(
        select(Favorite).where(Favorite.user_id == user_id, Favorite.product_id == product_id)
    )
    return result.scalars().first()


@router.get("/", response_model=List[ProductRead])
async def list_favorites(db: AsyncSession = Depends(get_async_session), user_id: int = Depends(get_current_user_id)):
    return await _list(db, user_id)


@router.post("/{product_id}", response_model=List[ProductRead], status_code=status.HTTP_201_CREATED)
async def add_favorite(product_id: int, db: AsyncSession = Depends(get_async_session),
                       user_id: int = Depends(get_current_user_id)):
    if not await ProductRepository(db).get(product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    if not await _get(db, user_id, product_id):  # idempotent
        db.add(Favorite(user_id=user_id, product_id=product_id))
        await db.commit()
    return await _list(db, user_id)


@router.delete("/{product_id}", response_model=List[ProductRead])
async def remove_favorite(product_id: int, db: AsyncSession = Depends(get_async_session),
                          user_id: int = Depends(get_current_user_id)):
    fav = await _get(db, user_id, product_id)
    if fav:
        await db.delete(fav)
        await db.commit()
    return await _list(db, user_id)
