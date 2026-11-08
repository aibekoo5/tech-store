from sqlalchemy import Column, String
from .base import Base


class SeededProduct(Base):
    """Names of catalog items already imported from seed_products.json.
    Lets admins delete a seeded product without it reappearing on the next start."""
    __tablename__ = "seeded_products"
    name = Column(String(256), primary_key=True)
