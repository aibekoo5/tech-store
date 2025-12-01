from fastapi import HTTPException, status

from schemas.orders import OrderCreate, OrderRead
from utils.unitofwork import IUnitOfWork


class OrdersService:
    async def create_order(self, uow: IUnitOfWork, user_id: int, payload: OrderCreate) -> int:
        async with uow:
            item_rows = []
            for item in payload.items:
                product = await uow.products.get_db_product(item.product_id)
                if not product:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {item.product_id} not found")
                if product.stock < item.quantity:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient stock for product {item.product_id}")
                # reserve stock
                product.stock -= item.quantity
                item_rows.append((item.product_id, item.quantity, float(product.price)))

            order_id = await uow.orders.add_with_items(user_id, "pending", item_rows)
            await uow.commit()
            return order_id

    async def list_orders(self, uow: IUnitOfWork, user_id: int) -> list[OrderRead]:
        async with uow:
            return await uow.orders.list_for_user(user_id)
