import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Product } from '../types';
import { getProduct } from '../api';
import {
  Badge,
  Button,
  EmptyState,
  QtyStepper,
  Spinner,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/format';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [qty, setQty] = useState<number>(1);
  const [adding, setAdding] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    setQty(1);

    getProduct(id ?? '')
      .then((p) => {
        if (active) setProduct(p);
      })
      .catch(() => {
        if (active) {
          setProduct(null);
          setNotFound(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleAdd = async () => {
    if (product == null) return;
    if (user == null) {
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await addItem(product.id, qty);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="pdp">
        <div className="text-center">
          <Spinner size="lg" label="Loading product" />
        </div>
      </div>
    );
  }

  if (notFound || product == null) {
    return (
      <div className="pdp">
        <EmptyState
          title="Product not found"
          message="The product you're looking for doesn't exist or is no longer available."
          action={
            <Button to="/shop" variant="primary">
              Back to shop
            </Button>
          }
        />
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <div className="pdp">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link className="breadcrumb__link" to="/shop">
          Shop
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          className="breadcrumb__link"
          to={`/shop?category=${product.category.slug}`}
        >
          {product.category.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span>{product.name}</span>
      </nav>

      <div className="pdp__grid">
        <div className="pdp__media">
          <img className="pdp__img" src={product.image_url} alt={product.name} />
        </div>

        <div className="pdp__info">
          <span className="pdp__brand">{product.brand.name}</span>
          <h1 className="pdp__title">{product.name}</h1>

          <div className="product-card__badges" style={{ position: 'static' }}>
            <Badge variant="primary">{product.category.name}</Badge>
            <Badge variant={outOfStock ? 'danger' : 'success'}>
              {outOfStock ? 'Out of stock' : 'In stock'}
            </Badge>
          </div>

          <div className="pdp__price">{formatCurrency(product.price)}</div>
          <p className="pdp__stock">
            {outOfStock
              ? 'Currently unavailable'
              : `${product.stock} in stock`}
          </p>

          <div className="pdp__actions">
            <QtyStepper
              value={qty}
              onChange={setQty}
              min={1}
              max={Math.max(1, product.stock)}
              disabled={outOfStock}
            />
            <Button onClick={handleAdd} disabled={outOfStock || adding}>
              {adding ? 'Adding…' : outOfStock ? 'Sold out' : 'Add to cart'}
            </Button>
          </div>

          <p className="pdp__desc">{product.description}</p>

          <div className="pdp__meta">
            <Link className="breadcrumb__link" to="/shop">
              &lsaquo; Back to shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
