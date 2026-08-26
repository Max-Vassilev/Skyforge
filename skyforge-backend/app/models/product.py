from __future__ import annotations

from decimal import Decimal
from typing import List, Optional

from sqlalchemy import ForeignKey, Index, Integer, Numeric, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Brand(Base):
    __tablename__ = "brands"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)

    products: Mapped[List["Product"]] = relationship(back_populates="brand")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)

    products: Mapped[List["Product"]] = relationship(back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    brand_id: Mapped[Optional[int]] = mapped_column(ForeignKey("brands.id"))
    category_id: Mapped[Optional[int]] = mapped_column(ForeignKey("categories.id"))

    brand: Mapped[Optional["Brand"]] = relationship(back_populates="products")
    category: Mapped[Optional["Category"]] = relationship(back_populates="products")

    __table_args__ = (
        Index("ix_products_brand_id", "brand_id"),
        Index("ix_products_category_id", "category_id"),
        Index("ix_products_name_lower", func.lower(name)),
    )
