from fastapi import HTTPException

from schemas.products import ProductCreate, ProductRead, ProductUpdate
from utils.unitofwork import IUnitOfWork


class ProductsService:
    async def list_products(self, uow: IUnitOfWork) -> list[ProductRead]:
        async with uow:
            return await uow.products.find_all()

    async def get_product(self, uow: IUnitOfWork, product_id: int) -> ProductRead:
        async with uow:
            product = await uow.products.find_one(id=product_id)
            if not product:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
            return product

    async def create_product(self, uow: IUnitOfWork, payload: ProductCreate) -> int:
        async with uow:
            product_id = await uow.products.add_one(payload.model_dump())
            await uow.commit()
            return product_id

    async def update_product(self, uow: IUnitOfWork, product_id: int, payload: ProductUpdate) -> None:
        async with uow:
            fields = {k: v for k, v in payload.model_dump().items() if v is not None}
            if not fields:
                return
            updated = await uow.products.edit_one(product_id, fields)
            if not updated:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
            await uow.commit()
