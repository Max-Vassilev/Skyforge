from __future__ import annotations

from typing import List

from pydantic import BaseModel, Field

from app.schemas.product import ProductOut


class CartItemOut(BaseModel):
    id: int
    quantity: int
    product: ProductOut


class CartOut(BaseModel):
    items: List[CartItemOut]
    subtotal: float
    count: int


class AddCartItemRequest(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class UpdateCartItemRequest(BaseModel):
    quantity: int
