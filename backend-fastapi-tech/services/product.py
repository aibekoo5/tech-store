from repositories.product import ProductRepository
from schemas.product import ProductCreate
from models.product import Product
from typing import List, Optional

class ProductService:
    def __init__(self, repo: ProductRepository):
        self.repo = repo

    async def get_product(self, product_id: int) -> Optional[Product]:
        return await self.repo.get(product_id)

    async def list_products(self) -> List[Product]:
        return await self.repo.list()

    async def create_product(self, product_data: ProductCreate) -> Product:
        return await self.repo.create(product_data)

    async def update_product(self, product_id: int, update_data: dict) -> Optional[Product]:
        return await self.repo.update(product_id, update_data)

    async def delete_product(self, product_id: int) -> bool:
        return await self.repo.delete(product_id)

