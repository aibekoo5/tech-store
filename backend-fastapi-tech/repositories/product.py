from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import NoResultFound
from models.product import Product
from schemas.product import ProductCreate
from typing import List, Optional

class ProductRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get(self, product_id: int) -> Optional[Product]:
        result = await self.db.execute(select(Product).where(Product.id == product_id))
        return result.scalars().first()

    async def list(self) -> List[Product]:
        result = await self.db.execute(select(Product))
        return result.scalars().all()

    async def create(self, product_data: ProductCreate) -> Product:
        product = Product(**product_data.model_dump())
        self.db.add(product)
        await self.db.commit()
        await self.db.refresh(product)
        return product

    async def update(self, product_id: int, update_data: dict) -> Optional[Product]:
        product = await self.get(product_id)
        if not product:
            return None
        for key, value in update_data.items():
            setattr(product, key, value)
        await self.db.commit()
        await self.db.refresh(product)
        return product

    async def delete(self, product_id: int) -> bool:
        product = await self.get(product_id)
        if not product:
            return False
        await self.db.delete(product)
        await self.db.commit()
        return True

