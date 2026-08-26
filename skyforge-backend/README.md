# Skyforge — Backend

> FastAPI · PostgreSQL · SQLAlchemy 2.0 · JWT · Docker

---

## Architecture

```
  Browser / Frontend
        │
        │ HTTP (port 8000)
        ▼
  ┌─────────────┐
  │   FastAPI   │  ← uvicorn ASGI
  │   app/      │
  │             │
  │  ┌────────┐ │     ┌──────────────────────┐
  │  │routers │─┼────►│  SQLAlchemy 2.0 ORM  │
  │  └────────┘ │     │  (async-style, sync)  │
  │  ┌────────┐ │     └──────────┬───────────┘
  │  │schemas │ │                │ psycopg2
  │  └────────┘ │                ▼
  │  ┌────────┐ │     ┌──────────────────────┐
  │  │models  │ │     │    PostgreSQL 16      │
  │  └────────┘ │     │   (Docker volume)     │
  └─────────────┘     └──────────────────────┘
```

---

## Module Structure

```
skyforge-backend/
└── app/
    ├── main.py            ← app factory  (create_app, CORS, startup)
    ├── config.py          ← Settings  (pydantic-settings, env vars)
    ├── database.py        ← engine · SessionLocal · Base · get_db
    ├── security.py        ← bcrypt hash · JWT encode/decode · get_current_user
    ├── seed.py            ← brand & category seed data
    ├── utils.py           ← serialize_product / cart / order helpers
    │
    ├── models/
    │   ├── user.py        ← User
    │   ├── product.py     ← Brand · Category · Product
    │   ├── cart.py        ← Cart · CartItem
    │   └── order.py       ← Order · OrderItem
    │
    ├── schemas/
    │   ├── auth.py        ← RegisterRequest · LoginRequest · TokenResponse · UserOut
    │   ├── product.py     ← BrandOut · CategoryOut · ProductOut · ProductListResponse
    │   ├── cart.py        ← CartOut · CartItemOut · AddCartItemRequest
    │   └── order.py       ← CheckoutRequest · OrderOut · OrderItemOut
    │
    ├── routers/
    │   ├── auth.py        ── /api/auth/*
    │   ├── catalog.py     ── /api/brands  /api/categories  /api/products
    │   ├── cart.py        ── /api/cart/*
    │   └── orders.py      ── /api/checkout  /api/orders/*
    │
    ├── requirements.txt
    └── Dockerfile
```

---

## API Endpoints

```
AUTH ─────────────────────────────────────────────────────────
  POST   /api/auth/register      Create account → JWT token
  POST   /api/auth/login         Login → JWT token
  POST   /api/auth/logout        Invalidate (stateless, client drops token)
  GET    /api/auth/me            Current user info          🔒

CATALOG ──────────────────────────────────────────────────────
  GET    /api/brands             List all brands
  GET    /api/categories         List all categories
  GET    /api/products           Paginated + search/filter/sort
  GET    /api/products/{id}      Single product

CART ─────────────────────────────────────────────────────────
  GET    /api/cart               Get cart                   🔒
  POST   /api/cart/items         Add item                   🔒
  PUT    /api/cart/items/{id}    Update quantity            🔒
  DELETE /api/cart/items/{id}    Remove item                🔒
  DELETE /api/cart               Clear cart                 🔒

ORDERS ───────────────────────────────────────────────────────
  POST   /api/checkout           Place order (clears cart)  🔒
  GET    /api/orders             Order history              🔒
  GET    /api/orders/{id}        Order detail               🔒

HEALTH ───────────────────────────────────────────────────────
  GET    /api/health             { status: "ok" }

  🔒 = Bearer token required
```

---

## Request Lifecycle

```
  Client
    │
    │  POST /api/checkout  { shipping_*, ... }
    │  Authorization: Bearer <jwt>
    ▼
  security.py ── decode JWT ──► get_current_user ──► User ORM object
    │
    ▼
  routers/orders.py
    ├── get_or_create_cart(db, user)
    ├── validate stock for each cart item
    ├── build Order + OrderItems
    ├── decrement product.stock
    ├── db.flush()  ← write but don't commit yet
    ├── delete cart items
    └── db.commit()
          │
          ▼
       re-fetch Order with selectinload(Order.items)
          │
          ▼
       serialize_order(order) → OrderOut JSON
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+psycopg2://droneshop:droneshop@localhost:5432/droneshop` | SQLAlchemy connection string |
| `SECRET_KEY` | `change-me-in-production-super-secret` | JWT signing secret |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Token lifetime (24 h) |

---

## Running with Docker

```bash
# From the project root (where docker-compose.yml lives):

docker-compose up --build -d        # first run
docker-compose logs -f api          # tail logs

# Full rebuild (drops DB volume):
docker-compose down -v --rmi all
docker-compose up --build -d
```

---

## Running Locally

```bash
cd skyforge-backend/app
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

export DATABASE_URL="postgresql+psycopg2://droneshop:droneshop@localhost:5432/droneshop"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | FastAPI 0.110+ |
| ORM | SQLAlchemy 2.0 (mapped_column style) |
| Validation | Pydantic v2 |
| Auth | python-jose (JWT HS256) + passlib (bcrypt) |
| Database | PostgreSQL 16 |
| Driver | psycopg2-binary |
| Config | pydantic-settings |
| Server | uvicorn |
| Container | Docker + Docker Compose |
