from backend.models.orders import OrderItem
from backend.utils.repository import SQLAlchemyRepository


class OrderItemsRepository(SQLAlchemyRepository):
    model = OrderItem
