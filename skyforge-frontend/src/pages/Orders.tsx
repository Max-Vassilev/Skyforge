import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../api';
import type { Order } from '../types';
import { Alert, Badge, Button, EmptyState, Spinner } from '../components/ui';
import { formatCurrency, formatDate } from '../lib/format';
import { orderStatusVariant } from '../lib/orderStatus';

export default function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getOrders()
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch(() => {
        if (active) setError('We could not load your orders. Please try again later.');
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="orders-page">
      <header className="page__head">
        <h1 className="page__title">Your orders</h1>
      </header>

      {error != null && <Alert variant="error">{error}</Alert>}

      {error == null && orders == null && (
        <div className="text-center">
          <Spinner size="lg" label="Loading orders" />
        </div>
      )}

      {error == null && orders != null && orders.length === 0 && (
        <EmptyState
          title="No orders yet"
          message="When you place an order, it will show up here."
          action={<Button to="/shop">Start shopping</Button>}
        />
      )}

      {error == null && orders != null && orders.length > 0 && (
        <div>
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card__main">
                <span className="order-card__id">Order #{order.id}</span>
                <span className="order-card__date">{formatDate(order.created_at)}</span>
                <Badge
                  className="order-card__status"
                  variant={orderStatusVariant(order.status)}
                >
                  {order.status}
                </Badge>
              </div>
              <span className="order-card__total">{formatCurrency(order.total)}</span>
              <Link to={`/orders/${order.id}`} className="order-card__link">
                View details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
