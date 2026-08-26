import { useState, useEffect, useRef, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { type CheckoutPayload } from '../api';
import { useCart } from '../context/CartContext';
import { Button, Input } from '../components/ui';
import OrderSummary from '../components/OrderSummary';

// Fix Leaflet's broken default icon paths under Vite
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const FORM_ID = 'checkout-form';
const SHIPPING_FEE = 8.99;
const DEFAULT_CENTER: [number, number] = [42.698, 23.322]; // Sofia

interface NominatimAddress {
  road?: string;
  house_number?: string;
  city?: string;
  town?: string;
  village?: string;
  postcode?: string;
  country?: string;
}

interface NominatimResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address: NominatimAddress;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16, { duration: 1 });
  }, [center, map]);
  return null;
}

async function nominatimSearch(query: string): Promise<NominatimResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
  const res = await fetch(url);
  return res.json() as Promise<NominatimResult[]>;
}

async function nominatimReverse(lat: number, lng: number): Promise<NominatimResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const res = await fetch(url);
    return res.json() as Promise<NominatimResult>;
  } catch {
    return null;
  }
}

function extractFields(r: NominatimResult): Partial<CheckoutPayload> {
  const a = r.address;
  const street = [a.road, a.house_number].filter(Boolean).join(' ');
  return {
    shipping_address: street || r.display_name.split(',')[0],
    shipping_city: a.city ?? a.town ?? a.village ?? '',
    shipping_zip: a.postcode ?? '',
    shipping_country: a.country ?? '',
    shipping_lat: parseFloat(r.lat),
    shipping_lng: parseFloat(r.lon),
    shipping_place_id: r.place_id,
  };
}

const EMPTY_FORM: CheckoutPayload = {
  shipping_name: '',
  shipping_email: '',
  shipping_phone: '',
  shipping_address: '',
  shipping_country: '',
  shipping_city: '',
  shipping_zip: '',
  shipping_lat: 0,
  shipping_lng: 0,
  shipping_place_id: '',
};

function loadSaved(): CheckoutPayload | null {
  try {
    const raw = sessionStorage.getItem('skyforge_checkout_data');
    return raw ? (JSON.parse(raw) as CheckoutPayload) : null;
  } catch { return null; }
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, count, subtotal } = useCart();

  const [form, setForm] = useState<CheckoutPayload>(() => loadSaved() ?? EMPTY_FORM);
  const [addressConfirmed, setAddressConfirmed] = useState(() => {
    const saved = loadSaved();
    return saved != null && saved.shipping_lat !== 0 && saved.shipping_lng !== 0;
  });
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(() => {
    const saved = loadSaved();
    return saved && saved.shipping_lat !== 0 ? [saved.shipping_lat, saved.shipping_lng] : DEFAULT_CENTER;
  });
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(() => {
    const saved = loadSaved();
    return saved && saved.shipping_lat !== 0 ? [saved.shipping_lat, saved.shipping_lng] : null;
  });
  const [confirmCandidate, setConfirmCandidate] = useState<NominatimResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isEmpty = (cart?.items.length ?? 0) === 0;

  const set = (key: keyof CheckoutPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const applyResult = useCallback((r: NominatimResult) => {
    const fields = extractFields(r);
    setForm((prev) => ({ ...prev, ...fields }));
    const pos: [number, number] = [parseFloat(r.lat), parseFloat(r.lon)];
    setMarkerPos(pos);
    setMapCenter(pos);
    setAddressConfirmed(true);
    setConfirmCandidate(null);
    setSuggestionsOpen(false);
    setSuggestions([]);
  }, []);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, shipping_address: value }));
    setAddressConfirmed(false);
    setConfirmCandidate(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length > 2) {
      debounceRef.current = setTimeout(() => {
        void nominatimSearch(value).then((results) => {
          setSuggestions(results);
          setSuggestionsOpen(results.length > 0);
        });
      }, 400);
    } else {
      setSuggestions([]);
      setSuggestionsOpen(false);
    }
  };

  const handleAddressBlur = async () => {
    // Let a mousedown on a suggestion register before closing
    await new Promise<void>((resolve) => setTimeout(resolve, 150));
    setSuggestionsOpen(false);
    if (addressConfirmed || !form.shipping_address.trim()) return;
    const results = await nominatimSearch(form.shipping_address);
    if (results.length > 0) {
      const best = results[0];
      setConfirmCandidate(best);
      const pos: [number, number] = [parseFloat(best.lat), parseFloat(best.lon)];
      setMarkerPos(pos);
      setMapCenter(pos);
    }
  };

  const handleMarkerDragEnd = async (lat: number, lng: number) => {
    const result = await nominatimReverse(lat, lng);
    if (result) {
      setForm((prev) => ({ ...prev, ...extractFields(result) }));
      setMarkerPos([lat, lng]);
      setAddressConfirmed(true);
      setConfirmCandidate(null);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEmpty || !addressConfirmed) return;
    sessionStorage.setItem('skyforge_checkout_data', JSON.stringify(form));
    navigate('/payment');
  };

  return (
    <div className="checkout-page">
      <header className="page__head">
        <h1 className="page__title">Checkout</h1>
      </header>

      <div className="checkout-layout">
        <form id={FORM_ID} className="checkout-form" onSubmit={handleSubmit}>
          <Input
            label="Full name"
            name="shipping_name"
            value={form.shipping_name}
            onChange={set('shipping_name')}
            autoComplete="name"
            required
          />

          <div className="form-grid form-grid--2">
            <Input
              label="Email"
              name="shipping_email"
              type="email"
              value={form.shipping_email}
              onChange={set('shipping_email')}
              autoComplete="email"
              required
            />
            <Input
              label="Phone"
              name="shipping_phone"
              type="tel"
              value={form.shipping_phone}
              onChange={set('shipping_phone')}
              autoComplete="tel"
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Input
              label="Address"
              name="shipping_address"
              value={form.shipping_address}
              onChange={handleAddressChange}
              onBlur={() => void handleAddressBlur()}
              autoComplete="off"
              required
            />
            {suggestionsOpen && suggestions.length > 0 && (
              <ul className="address-suggestions">
                {suggestions.map((s) => (
                  <li
                    key={s.place_id}
                    onMouseDown={() => applyResult(s)}
                    className="address-suggestions__item"
                  >
                    {s.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {confirmCandidate != null && !addressConfirmed && (
            <div className="address-confirm-banner">
              <span className="address-confirm-banner__text">
                Did you mean: <strong>{confirmCandidate.display_name}</strong>?
              </span>
              <div className="address-confirm-banner__actions">
                <Button size="sm" onClick={() => applyResult(confirmCandidate)}>
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setConfirmCandidate(null); setMarkerPos(null); }}
                >
                  Edit
                </Button>
              </div>
            </div>
          )}

          <Input
            label="Country"
            name="shipping_country"
            value={form.shipping_country}
            onChange={set('shipping_country')}
            autoComplete="country-name"
            required
          />

          <div className="form-grid form-grid--2">
            <Input
              label="City"
              name="shipping_city"
              value={form.shipping_city}
              onChange={set('shipping_city')}
              autoComplete="address-level2"
              required
            />
            <Input
              label="ZIP / Postal code"
              name="shipping_zip"
              value={form.shipping_zip}
              onChange={set('shipping_zip')}
              autoComplete="postal-code"
              required
            />
          </div>

          <div className="checkout-map">
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={12}
              style={{ height: '260px', width: '100%', borderRadius: '8px' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {markerPos != null && (
                <>
                  <MapController center={mapCenter} />
                  <Marker
                    position={markerPos}
                    draggable={true}
                    eventHandlers={{
                      dragend: (e) => {
                        const { lat, lng } = (e.target as L.Marker).getLatLng();
                        void handleMarkerDragEnd(lat, lng);
                      },
                    }}
                  />
                </>
              )}
            </MapContainer>
            {!addressConfirmed && (
              <p className="checkout-map__hint">
                Search for your address above to pin it on the map before placing your order.
              </p>
            )}
          </div>
        </form>

        <div className="cart-aside">
          <OrderSummary subtotal={subtotal} itemCount={count} shipping={SHIPPING_FEE}>
            <Button
              type="submit"
              form={FORM_ID}
              block
              disabled={isEmpty || !addressConfirmed}
              title={!addressConfirmed ? 'Please confirm your address on the map' : undefined}
            >
              Continue to payment
            </Button>
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}
