from datetime import datetime
from pydantic import BaseModel
from typing import List
from schemas.product import ProductRead

class OrderItemRead(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: ProductRead

    model_config = {"from_attributes": True}

class OrderRead(BaseModel):
    id: int
    user_id: int
    total_price: float
    status: str
    created_at: datetime
    items: List[OrderItemRead] = []

    model_config = {"from_attributes": True}
