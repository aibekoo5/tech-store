from models.orders import OrderItem
from utils.repository import SQLAlchemyRepository


class OrderItemsRepository(SQLAlchemyRepository):
    model = OrderItem
