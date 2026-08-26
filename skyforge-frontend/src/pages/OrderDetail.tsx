import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrder } from '../api';
import type { Order } from '../types';
import { Alert, Badge, Button, EmptyState, Spinner } from '../components/ui';
import { formatCurrency, formatDate } from '../lib/format';
import { orderStatusVariant } from '../lib/orderStatus';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; order: Order }
  | { status: 'not-found' }
  | { status: 'error' };

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    if (id == null) {
      setState({ status: 'not-found' });
      return;
    }
    let active = true;
    setState({ status: 'loading' });
    getOrder(id)
      .then((order) => {
        if (active) setState({ status: 'ready', order });
      })
      .catch((err) => {
        if (!active) return;
        const code = err?.response?.status;
        setState({ status: code === 404 ? 'not-found' : 'error' });
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (state.status === 'loading') {
    return (
      <div className="order-detail text-center">
        <Spinner size="lg" label="Loading order" />
      </div>
    );
  }

  if (state.status === 'not-found') {
    return (
      <div className="order-detail">
        <EmptyState
          title="Order not found"
          message="We couldn't find that order. It may have been removed or the link is incorrect."
          action={<Button to="/orders">Back to orders</Button>}
        />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="order-detail">
        <Alert variant="error">
          Something went wrong loading this order. Please try again later.
        </Alert>
      </div>
    );
  }

  const { order } = state;

  return (
    <div className="order-detail">
      <header className="order-detail__head">
        <div className="stack stack--sm">
          <h1>Order #{order.id}</h1>
          <span className="muted">{formatDate(order.created_at)}</span>
        </div>
        <Badge variant={orderStatusVariant(order.status)}>{order.status}</Badge>
      </header>

      <section className="order-detail__section">
        <h3>Items</h3>
        <div className="order-lines">
          {order.items.map((line) => (
            <div key={line.product_id} className="order-line">
              <Link to={`/product/${line.product_id}`} className="order-line__name">
                {line.product_name}
              </Link>
              <span className="order-line__qty">
                {line.quantity} × {formatCurrency(line.unit_price)}
              </span>
              <span className="order-line__price">
                {formatCurrency(line.unit_price * line.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="summary__total">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </section>

      <section className="order-detail__section">
        <h3>Shipping</h3>
        <div className="ship-info">
          <div>{order.shipping_name}</div>
          <div>{order.shipping_address}</div>
          <div>
            {order.shipping_city} {order.shipping_zip}
          </div>
        </div>
      </section>
    </div>
  );
}
