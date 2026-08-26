import { useCart } from '../context/CartContext';
import { Button, EmptyState, Spinner } from '../components/ui';
import CartLineItem from '../components/CartLineItem';
import OrderSummary from '../components/OrderSummary';

export default function Cart() {
  const { cart, loading, count, subtotal, clear } = useCart();

  if (loading && cart == null) {
    return (
      <div className="cart-page text-center">
        <Spinner size="lg" label="Loading cart" />
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <EmptyState
          title="Your cart is empty"
          message="Browse the shop and add some drones to get started."
          action={<Button to="/shop">Continue shopping</Button>}
        />
      </div>
    );
  }

  return (
    <div className="cart-page">
      <header className="page__head">
        <h1 className="page__title">Your cart</h1>
      </header>

      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => (
            <CartLineItem key={item.id} item={item} />
          ))}
        </div>

        <div className="cart-aside">
          <OrderSummary subtotal={subtotal} itemCount={count} shipping={0}>
            <Button to="/checkout" block>
              Checkout
            </Button>
            <Button variant="ghost" block onClick={() => void clear()}>
              Clear cart
            </Button>
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}
