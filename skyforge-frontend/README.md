# Skyforge — Frontend

> React 18 · TypeScript · Vite · React Router v6 · Axios

---

## Architecture

```
  ┌───────────────────────────────────────────────────┐
  │                   Browser                         │
  │                                                   │
  │  ┌─────────────────────────────────────────────┐  │
  │  │              React App                      │  │
  │  │                                             │  │
  │  │  ┌──────────┐   ┌───────────────────────┐  │  │
  │  │  │  Context │   │        Pages          │  │  │
  │  │  │          │   │                       │  │  │
  │  │  │ AuthCtx  │◄──┤  Landing  Catalog     │  │  │
  │  │  │ CartCtx  │   │  Cart     Checkout    │  │  │
  │  │  └────┬─────┘   │  Orders   Payment     │  │  │
  │  │       │         └───────────┬───────────┘  │  │
  │  │       │                     │               │  │
  │  │       └──────────┬──────────┘               │  │
  │  │                  ▼                          │  │
  │  │         ┌────────────────┐                  │  │
  │  │         │   src/api/     │                  │  │
  │  │         │  axios client  │                  │  │
  │  └─────────┴───────┬────────┴──────────────────┘  │
  └───────────────────┬┘                              │
                      │ HTTP/JSON (port 8000)
                      ▼
             ┌─────────────────┐
             │ Skyforge Backend │
             │    FastAPI       │
             └─────────────────┘
```

---

## Page Routes

```
  /                  Landing        ← featured product showcase
  /shop              Catalog        ← search · filter · sort · paginate
  /product/:id       ProductDetail  ← images · stock · add to cart
  /cart              Cart           ← line items · qty stepper · subtotal
  /login             Login
  /register          Register
  /checkout     🔒   Checkout       ← shipping address (map picker)
  /payment      🔒   Payment        ← card details → place order
  /orders       🔒   Orders         ← order history list
  /orders/:id   🔒   OrderDetail    ← full order breakdown

  🔒 = redirect to /login if not authenticated
```

---

## Source Structure

```
skyforge-frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── nginx.conf             ← production static file server + image proxy
└── src/
    ├── main.tsx           ← entry point  (React root, providers)
    ├── App.tsx            ← route tree   (react-router-dom v6)
    ├── index.css          ← global styles + design tokens (CSS vars)
    ├── types.ts           ← shared TypeScript interfaces
    │
    ├── api/               ← axios client + domain functions
    │   ├── client.ts      ← axios instance · Bearer interceptor · token helpers
    │   ├── auth.ts        ── login · register · getMe
    │   ├── catalog.ts     ── getBrands · getCategories · getProducts · getProduct
    │   ├── cart.ts        ── getCart · addToCart · updateCartItem · removeCartItem
    │   ├── orders.ts      ── checkout · getOrders · getOrder
    │   └── index.ts       ← re-exports everything (single import point)
    │
    ├── context/
    │   ├── AuthContext.tsx ← user state · login/logout · token persistence
    │   └── CartContext.tsx ← cart state · add/remove/update · count badge
    │
    ├── pages/
    │   ├── Landing.tsx
    │   ├── Catalog.tsx
    │   ├── ProductDetail.tsx
    │   ├── Cart.tsx
    │   ├── Checkout.tsx
    │   ├── Payment.tsx
    │   ├── Login.tsx
    │   ├── Register.tsx
    │   ├── Orders.tsx
    │   ├── OrderDetail.tsx
    │   └── NotFound.tsx
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx     ← logo · search · cart badge · auth links
    │   │   ├── Footer.tsx     ← brand · shop links · company links
    │   │   └── Layout.tsx     ← Outlet wrapper
    │   ├── ui/                ← design-system primitives
    │   │   ├── Button.tsx     Alert.tsx   Badge.tsx   Card.tsx
    │   │   ├── Input.tsx      Select.tsx  Textarea.tsx
    │   │   ├── Spinner.tsx    Skeleton.tsx EmptyState.tsx
    │   │   ├── QtyStepper.tsx IconButton.tsx Container.tsx
    │   │   └── index.ts       ← barrel export
    │   ├── ProductCard.tsx
    │   ├── ProductGrid.tsx
    │   ├── CartLineItem.tsx
    │   ├── Filters.tsx
    │   ├── Pagination.tsx
    │   ├── OrderSummary.tsx
    │   ├── SearchBar.tsx
    │   ├── ProtectedRoute.tsx
    │   └── index.ts
    │
    └── lib/
        ├── format.ts          ← formatPrice · formatDate helpers
        └── orderStatus.ts     ← order status label/color map
```

---

## Data Flow

```
  User action (e.g. "Add to Cart")
        │
        ▼
  ProductDetail.tsx
        │  calls
        ▼
  CartContext.addItem(productId, qty)
        │  calls
        ▼
  api/cart.ts → addToCart(productId, qty)
        │  axios POST /api/cart/items
        ▼
  Backend → returns updated Cart
        │
        ▼
  CartContext state updated → count badge re-renders in Navbar
```

---

## Auth Flow

```
  Login page ──► api/auth.ts login() ──► POST /api/auth/login
                                                │
                              ◄── { access_token, user }
                                                │
                      setToken(token)  ◄────────┘
                      AuthContext.setUser(user)
                                │
                      axios interceptor auto-attaches
                      Authorization: Bearer <token>
                      on every subsequent request
```

---

## Running Locally

```bash
cd skyforge-frontend
npm install
npm run dev        # → http://localhost:5173
```

Requires the backend running on `http://localhost:8000`
(or set `VITE_API_URL` in `.env`).

---

## Running with Docker

```bash
# From the project root:
docker-compose up --build -d
# Frontend → http://localhost:3000
```

Product images are served from the `skyforge-images/` volume at `/images/*`.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 |
| Language | TypeScript 5 |
| Build | Vite 5 |
| Routing | react-router-dom v6 |
| HTTP | axios |
| Styles | Plain CSS (custom properties / design tokens) |
| Server | nginx (Docker production build) |
