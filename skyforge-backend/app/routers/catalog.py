from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.product import Brand, Category, Product
from app.schemas.product import BrandOut, CategoryOut, ProductListResponse, ProductOut
from app.utils import serialize_product

router = APIRouter(tags=["catalog"])


@router.get("/api/brands", response_model=List[BrandOut])
def list_brands(db: Session = Depends(get_db)):
    brands = db.scalars(select(Brand).order_by(Brand.name)).all()
    return [BrandOut.model_validate(b) for b in brands]


@router.get("/api/categories", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    cats = db.scalars(select(Category).order_by(Category.id)).all()
    return [CategoryOut.model_validate(c) for c in cats]


@router.get("/api/products", response_model=ProductListResponse)
def list_products(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None),
    brand: Optional[List[str]] = Query(None),
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    sort: str = Query("name_asc", pattern="^(price_asc|price_desc|name_asc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=48),
):
    stmt = select(Product).options(selectinload(Product.brand), selectinload(Product.category))

    if search:
        like = f"%{search}%"
        stmt = stmt.where(or_(Product.name.ilike(like), Product.description.ilike(like)))

    if brand:
        slugs: List[str] = []
        for b in brand:
            slugs.extend(s.strip() for s in b.split(",") if s.strip())
        if slugs:
            stmt = stmt.join(Brand, Product.brand_id == Brand.id).where(Brand.slug.in_(slugs))

    if category:
        stmt = stmt.join(Category, Product.category_id == Category.id).where(Category.slug == category)

    if min_price is not None:
        stmt = stmt.where(Product.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Product.price <= max_price)

    total = db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery())) or 0

    if sort == "price_asc":
        stmt = stmt.order_by(Product.price.asc(), Product.id.asc())
    elif sort == "price_desc":
        stmt = stmt.order_by(Product.price.desc(), Product.id.asc())
    else:
        stmt = stmt.order_by(func.lower(Product.name).asc(), Product.id.asc())

    stmt = stmt.limit(page_size).offset((page - 1) * page_size)
    products = db.scalars(stmt).all()

    total_pages = (total + page_size - 1) // page_size if page_size else 0
    return ProductListResponse(
        items=[serialize_product(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/api/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.scalar(
        select(Product)
        .options(selectinload(Product.brand), selectinload(Product.category))
        .where(Product.id == product_id)
    )
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_product(product)
