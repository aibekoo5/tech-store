from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db.db import Base
from backend.schemas.products import ProductRead


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    image_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    order_items = relationship("OrderItem", back_populates="product")

    def to_read_model(self) -> ProductRead:
        return ProductRead(
            id=self.id,
            name=self.name,
            description=self.description,
            price=self.price,
            stock=self.stock,
            image_url=self.image_url,
            created_at=self.created_at,
        )
