import type { MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import type { Product } from '../types';
import { Badge, Button, Card } from './ui';
import type { CardProps } from './ui';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/format';

// Card renders its `as` element and forwards extra props, so it can act as a
// router Link. Type it accordingly for the link-specific props.
const CardLink = Card as (props: CardProps & Pick<LinkProps, 'to'>) => JSX.Element;

export interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();

  const handleAdd = (e: MouseEvent<HTMLButtonElement>) => {
    // Keep the click from triggering the enclosing card link.
    e.preventDefault();
    e.stopPropagation();
    if (user == null) {
      navigate('/login');
      return;
    }
    void addItem(product.id);
  };

  const outOfStock = product.stock <= 0;

  return (
    <CardLink
      as={Link}
      to={`/product/${product.id}`}
      interactive
      className="product-card"
    >
      <div className="product-card__media">
        <img
          className="product-card__img"
          src={product.image_url}
          alt={product.name}
          loading="lazy"
        />
        <div className="product-card__badges">
          <Badge variant="primary">{product.category.name}</Badge>
        </div>
      </div>

      <div className="product-card__body">
        <span className="product-card__brand">{product.brand.name}</span>
        <span className="product-card__name">{product.name}</span>
        <div className="product-card__foot">
          <span className="product-card__price">
            {formatCurrency(product.price)}
          </span>
          <div className="product-card__actions">
            <Button size="sm" onClick={handleAdd} disabled={outOfStock}>
              {outOfStock ? 'Sold out' : 'Add to cart'}
            </Button>
          </div>
        </div>
      </div>
    </CardLink>
  );
}
