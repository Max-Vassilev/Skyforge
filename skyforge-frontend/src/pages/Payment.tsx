import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkout, type CheckoutPayload } from '../api';
import { useCart } from '../context/CartContext';
import { Alert, Button, Input } from '../components/ui';
import OrderSummary from '../components/OrderSummary';

const SHIPPING_FEE = 8.99;
const SESSION_KEY = 'skyforge_checkout_data';

function formatCardNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export default function Payment() {
  const navigate = useNavigate();
  const { count, subtotal, refresh } = useCart();

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) navigate('/checkout');
  }, [navigate]);

  const handlePlaceOrder = async () => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) { navigate('/checkout'); return; }
    let payload: CheckoutPayload;
    try { payload = JSON.parse(raw) as CheckoutPayload; }
    catch { navigate('/checkout'); return; }

    if (!cardName.trim()) { setError('Please enter the cardholder name.'); return; }
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length !== 16) { setError('Please enter a valid 16-digit card number.'); return; }
    if (expiry.length !== 5) { setError('Please enter a valid expiry date (MM/YY).'); return; }
    if (cvv.length < 3) { setError('Please enter a valid CVV.'); return; }

    setSubmitting(true);
    setError(null);
    try {
      const order = await checkout(payload);
      sessionStorage.removeItem(SESSION_KEY);
      await refresh();
      navigate(`/orders/${order.id}`);
    } catch {
      setError('We could not place your order. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <header className="page__head">
        <h1 className="page__title">Payment</h1>
      </header>

      <div className="checkout-layout">
        <div className="checkout-form">
          {error != null && <Alert variant="error">{error}</Alert>}

          {/* Card form */}
          <div className="payment-card-form">
              <Input
                label="Cardholder name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                autoComplete="cc-name"
                placeholder="Name on card"
              />
              <Input
                label="Card number"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                autoComplete="cc-number"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
              <div className="form-grid form-grid--2">
                <Input
                  label="Expiry (MM/YY)"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  autoComplete="cc-exp"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  maxLength={5}
                />
                <Input
                  label="CVV"
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  autoComplete="cc-csc"
                  inputMode="numeric"
                  placeholder="•••"
                  maxLength={4}
                />
              </div>
            </div>

          <p className="payment-secure-note">
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}>
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd"/>
            </svg>
            Your payment info is encrypted and secure.
          </p>
        </div>

        <div className="cart-aside">
          <OrderSummary subtotal={subtotal} itemCount={count} shipping={SHIPPING_FEE}>
            <Button block onClick={() => void handlePlaceOrder()} disabled={submitting}>
              {submitting ? 'Placing order…' : 'Place order'}
            </Button>
            <Button variant="ghost" block to="/checkout">
              Back to shipping
            </Button>
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}
