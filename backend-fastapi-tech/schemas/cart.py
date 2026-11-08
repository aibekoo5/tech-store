from pydantic import BaseModel, Field
from typing import List
from schemas.product import ProductRead

class CartItemBase(BaseModel):
    product_id: int
    quantity: int = Field(default=1)

class CartItemRead(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductRead

    model_config = {"from_attributes": True}

class CartRead(BaseModel):
    id: int
    user_id: int
    items: List[CartItemRead] = []

    model_config = {"from_attributes": True}
