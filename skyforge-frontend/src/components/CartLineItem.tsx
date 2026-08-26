import { Link } from 'react-router-dom';
import type { CartItem } from '../types';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/format';
import { IconButton, QtyStepper } from '../components/ui';

export interface CartLineItemProps {
  item: CartItem;
}

export default function CartLineItem({ item }: CartLineItemProps) {
  const { updateItem, removeItem } = useCart();
  const { product, quantity } = item;
  const lineTotal = product.price * quantity;

  return (
    <div className="cart-item">
      <Link to={`/product/${product.id}`} className="cart-item__media">
        <img className="cart-item__img" src={product.image_url} alt={product.name} />
      </Link>

      <div className="cart-item__info">
        <Link to={`/product/${product.id}`} className="cart-item__name">
          {product.name}
        </Link>
        <span className="cart-item__brand">{product.brand.name}</span>
        <span className="cart-item__price">{formatCurrency(product.price)} each</span>
        <div className="cart-item__qty">
          <QtyStepper
            value={quantity}
            onChange={(qty) => void updateItem(item.id, qty)}
            max={Math.max(product.stock, 1)}
          />
        </div>
      </div>

      <div className="cart-item__line">
        <span>{formatCurrency(lineTotal)}</span>
        <IconButton
          className="cart-item__remove"
          label={`Remove ${product.name}`}
          onClick={() => void removeItem(item.id)}
        >
          Remove
        </IconButton>
      </div>
    </div>
  );
}
