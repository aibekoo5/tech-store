from datetime import datetime
from typing import List

from pydantic import BaseModel


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderItemRead(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]


class OrderRead(BaseModel):
    id: int
    user_id: int
    status: str
    created_at: datetime
    items: List[OrderItemRead]

    class Config:
        from_attributes = True
