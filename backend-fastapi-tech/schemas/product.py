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


class ProductUpdate(BaseModel):
    """Partial update: only the fields that are sent are changed."""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    image_url: Optional[str] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    badge: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    specs: Optional[Dict[str, str]] = None
