from sqlalchemy import insert, select

from models.orders import Order, OrderItem
from utils.repository import SQLAlchemyRepository


class OrdersRepository(SQLAlchemyRepository):
    model = Order

    async def add_with_items(self, user_id: int, status: str, items: list[tuple[int, int, float]]):
        order_stmt = insert(Order).values(user_id=user_id, status=status).returning(Order.id)
        order_res = await self.session.execute(order_stmt)
        order_id = order_res.scalar_one()

        if items:
            item_stmt = insert(OrderItem)
            values = [
                {
                    "order_id": order_id,
                    "product_id": product_id,
                    "quantity": quantity,
                    "unit_price": unit_price,
                }
                for product_id, quantity, unit_price in items
            ]
            await self.session.execute(item_stmt, values)
        return order_id

    async def list_for_user(self, user_id: int):
        stmt = select(Order).filter_by(user_id=user_id)
        res = await self.session.execute(stmt)
        return [row[0].to_read_model() for row in res.all()]
