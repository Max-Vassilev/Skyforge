from __future__ import annotations

from app.schemas.cart import CartItemOut, CartOut
from app.schemas.order import OrderItemOut, OrderOut
from app.schemas.product import BrandOut, CategoryOut, ProductOut
from app.models.cart import Cart
from app.models.order import Order
from app.models.product import Product
from app.models.user import User
from sqlalchemy import select
from sqlalchemy.orm import Session


def serialize_product(p: Product) -> ProductOut:
    return ProductOut(
        id=p.id,
        name=p.name,
        description=p.description,
        price=float(p.price),
        image_url=p.image_url,
        stock=p.stock,
        brand=BrandOut.model_validate(p.brand) if p.brand else None,
        category=CategoryOut.model_validate(p.category) if p.category else None,
    )


def serialize_cart(cart: Cart) -> CartOut:
    items = sorted(cart.items, key=lambda ci: ci.id)
    out_items = [
        CartItemOut(id=ci.id, quantity=ci.quantity, product=serialize_product(ci.product))
        for ci in items
    ]
    subtotal = sum(float(ci.product.price) * ci.quantity for ci in items)
    count = sum(ci.quantity for ci in items)
    return CartOut(items=out_items, subtotal=round(subtotal, 2), count=count)


def serialize_order(order: Order) -> OrderOut:
    return OrderOut(
        id=order.id,
        total=float(order.total),
        status=order.status,
        shipping_name=order.shipping_name,
        shipping_address=order.shipping_address,
        shipping_city=order.shipping_city,
        shipping_zip=order.shipping_zip,
        created_at=order.created_at,
        items=[
            OrderItemOut(
                product_name=oi.product_name,
                unit_price=float(oi.unit_price),
                quantity=oi.quantity,
                product_id=oi.product_id,
            )
            for oi in order.items
        ],
    )


def get_or_create_cart(db: Session, user: User) -> Cart:
    cart = db.scalar(select(Cart).where(Cart.user_id == user.id))
    if cart is None:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart
