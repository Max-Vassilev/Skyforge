from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class CheckoutRequest(BaseModel):
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_zip: str
    shipping_email: Optional[str] = None
    shipping_phone: Optional[str] = None
    shipping_country: Optional[str] = None
    shipping_lat: Optional[float] = None
    shipping_lng: Optional[float] = None
    shipping_place_id: Optional[str] = None


class OrderItemOut(BaseModel):
    product_name: str
    unit_price: float
    quantity: int
    product_id: int


class OrderOut(BaseModel):
    id: int
    total: float
    status: str
    shipping_name: Optional[str] = None
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_zip: Optional[str] = None
    created_at: datetime
    items: List[OrderItemOut]
