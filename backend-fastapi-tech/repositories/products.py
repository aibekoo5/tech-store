from sqlalchemy import select

from models.products import Product
from utils.repository import SQLAlchemyRepository


class ProductsRepository(SQLAlchemyRepository):
    model = Product

    async def get_db_product(self, product_id: int) -> Product | None:
        stmt = select(Product).filter_by(id=product_id)
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()
