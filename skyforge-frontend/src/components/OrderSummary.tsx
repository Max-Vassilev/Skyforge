import type { ReactNode } from 'react';
import { formatCurrency } from '../lib/format';

export interface OrderSummaryProps {
  subtotal: number;
  itemCount: number;
  shipping?: number;
  children?: ReactNode;
}

export default function OrderSummary({ subtotal, itemCount, shipping = 8.99, children }: OrderSummaryProps) {
  return (
    <aside className="summary">
      <h2 className="summary__title">Order summary</h2>

      <div className="summary__row">
        <span className="summary__label">
          Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </span>
        <span className="summary__value">{formatCurrency(subtotal)}</span>
      </div>

      <div className="summary__row">
        <span className="summary__label">Shipping</span>
        <span className="summary__value">{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
      </div>

      <div className="summary__total">
        <span>Total</span>
        <span>{formatCurrency(subtotal + shipping)}</span>
      </div>

      {children != null && <div className="stack">{children}</div>}
    </aside>
  );
}
