from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import AddCartItemRequest, CartOut, UpdateCartItemRequest
from app.security import get_current_user
from app.utils import get_or_create_cart, serialize_cart

router = APIRouter(prefix="/api/cart", tags=["cart"])


@router.get("", response_model=CartOut)
def get_cart(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = get_or_create_cart(db, current)
    return serialize_cart(cart)


@router.post("/items", response_model=CartOut)
def add_cart_item(
    body: AddCartItemRequest,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = get_or_create_cart(db, current)
    product = db.get(Product, body.product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    item = db.scalar(
        select(CartItem).where(CartItem.cart_id == cart.id, CartItem.product_id == body.product_id)
    )
    new_qty = (item.quantity if item else 0) + body.quantity
    if new_qty > product.stock:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Insufficient stock for '{product.name}' (available: {product.stock})",
        )

    if item:
        item.quantity = new_qty
    else:
        item = CartItem(cart_id=cart.id, product_id=body.product_id, quantity=body.quantity)
        db.add(item)
    db.commit()
    db.refresh(cart)
    return serialize_cart(cart)


@router.put("/items/{item_id}", response_model=CartOut)
def update_cart_item(
    item_id: int,
    body: UpdateCartItemRequest,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = get_or_create_cart(db, current)
    item = db.scalar(select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart.id))
    if item is None:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if body.quantity <= 0:
        db.delete(item)
    else:
        product = db.get(Product, item.product_id)
        if product and body.quantity > product.stock:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Insufficient stock for '{product.name}' (available: {product.stock})",
            )
        item.quantity = body.quantity
    db.commit()
    db.refresh(cart)
    return serialize_cart(cart)


@router.delete("/items/{item_id}", response_model=CartOut)
def delete_cart_item(
    item_id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = get_or_create_cart(db, current)
    item = db.scalar(select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart.id))
    if item is None:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    db.refresh(cart)
    return serialize_cart(cart)


@router.delete("", response_model=CartOut)
def clear_cart(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = get_or_create_cart(db, current)
    for item in list(cart.items):
        db.delete(item)
    db.commit()
    db.refresh(cart)
    return serialize_cart(cart)
