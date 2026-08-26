from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class BrandOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str


class ProductOut(BaseModel):
    id: int
    name: str
    description: str
    price: float
    image_url: str
    stock: int
    brand: Optional[BrandOut] = None
    category: Optional[CategoryOut] = None


class ProductListResponse(BaseModel):
    items: List[ProductOut]
    total: int
    page: int
    page_size: int
    total_pages: int
