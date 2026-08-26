from __future__ import annotations

from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import CheckoutRequest, OrderOut
from app.security import get_current_user
from app.utils import get_or_create_cart, serialize_order

router = APIRouter(tags=["orders"])


@router.post("/api/checkout", response_model=OrderOut)
def checkout(
    body: CheckoutRequest,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = get_or_create_cart(db, current)
    items = list(cart.items)
    if not items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = Decimal("0.00")
    order = Order(
        user_id=current.id,
        total=Decimal("0.00"),
        status="pending",
        shipping_name=body.shipping_name,
        shipping_address=body.shipping_address,
        shipping_city=body.shipping_city,
        shipping_zip=body.shipping_zip,
        shipping_email=body.shipping_email,
        shipping_phone=body.shipping_phone,
        shipping_country=body.shipping_country,
        shipping_lat=Decimal(str(body.shipping_lat)) if body.shipping_lat is not None else None,
        shipping_lng=Decimal(str(body.shipping_lng)) if body.shipping_lng is not None else None,
        shipping_place_id=body.shipping_place_id,
    )

    try:
        for ci in items:
            product = db.get(Product, ci.product_id)
            if product is None:
                raise HTTPException(status_code=404, detail=f"Product {ci.product_id} no longer exists")
            if ci.quantity > product.stock:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Insufficient stock for '{product.name}' (available: {product.stock})",
                )
            total += product.price * ci.quantity
            order.items.append(
                OrderItem(
                    product_id=product.id,
                    product_name=product.name,
                    unit_price=product.price,
                    quantity=ci.quantity,
                )
            )
            product.stock -= ci.quantity

        order.total = total + Decimal("8.99")
        db.add(order)
        for ci in items:
            db.delete(ci)
        db.flush()
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Checkout failed")

    db.commit()
    placed = db.scalar(select(Order).where(Order.id == order.id).options(selectinload(Order.items)))
    return serialize_order(placed)


@router.get("/api/orders", response_model=List[OrderOut])
def list_orders(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = db.scalars(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.user_id == current.id)
        .order_by(Order.created_at.desc(), Order.id.desc())
    ).all()
    return [serialize_order(o) for o in orders]


@router.get("/api/orders/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.scalar(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id, Order.user_id == current.id)
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return serialize_order(order)
