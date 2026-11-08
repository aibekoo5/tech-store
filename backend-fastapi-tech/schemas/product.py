from pydantic import BaseModel
from typing import Optional, Dict

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    image_url: Optional[str] = None
    stock: int = 0
    category: Optional[str] = None
    badge: Optional[str] = None
    rating: float = 0
    reviews: int = 0
    specs: Dict[str, str] = {}

class ProductCreate(ProductBase):
    pass

class ProductRead(ProductBase):
    id: int

    model_config = {"from_attributes": True}
