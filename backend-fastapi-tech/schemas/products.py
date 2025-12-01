from datetime import datetime

from pydantic import BaseModel


class ProductRead(BaseModel):
    id: int
    name: str
    description: str
    price: float
    stock: int
    image_url: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    image_url: str | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    stock: int | None = None
    image_url: str | None = None
