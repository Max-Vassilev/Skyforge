import type { BadgeProps } from '../components/ui';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

/** Map an order status string to a Badge variant. */
export function orderStatusVariant(status: string): BadgeVariant {
  switch (status.toLowerCase()) {
    case 'delivered':
    case 'completed':
    case 'paid':
      return 'success';
    case 'shipped':
    case 'processing':
      return 'primary';
    case 'pending':
      return 'warning';
    case 'cancelled':
    case 'canceled':
    case 'failed':
      return 'danger';
    default:
      return 'neutral';
  }
}
