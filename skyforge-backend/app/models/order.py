from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import ForeignKey, Integer, Numeric, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="pending")
    shipping_name: Mapped[Optional[str]] = mapped_column(Text)
    shipping_address: Mapped[Optional[str]] = mapped_column(Text)
    shipping_city: Mapped[Optional[str]] = mapped_column(Text)
    shipping_zip: Mapped[Optional[str]] = mapped_column(Text)
    shipping_email: Mapped[Optional[str]] = mapped_column(Text)
    shipping_phone: Mapped[Optional[str]] = mapped_column(Text)
    shipping_country: Mapped[Optional[str]] = mapped_column(Text)
    shipping_lat: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7))
    shipping_lng: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7))
    shipping_place_id: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    product_name: Mapped[str] = mapped_column(Text, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)

    order: Mapped["Order"] = relationship(back_populates="items")
