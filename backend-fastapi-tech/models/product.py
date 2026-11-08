from sqlalchemy import Column, Integer, String, Float, Text, JSON
from .base import Base

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    image_url = Column(String(500))
    stock = Column(Integer, default=0)
    category = Column(String(100), index=True)
    badge = Column(String(50), nullable=True)
    rating = Column(Float, default=0)
    reviews = Column(Integer, default=0)
    specs = Column(JSON, default=dict)
