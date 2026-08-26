-- ============================================================================
-- Drone Shop Backend :: DATABASE DDL
-- Target: PostgreSQL 16
-- Idempotent schema definition (safe to re-run). No data is inserted here.
-- ============================================================================

-- Extensions -----------------------------------------------------------------
-- pg_trgm powers fast, index-backed ILIKE / similarity search on product names.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ----------------------------------------------------------------------------
-- users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         TEXT        NOT NULL UNIQUE,
    password_hash TEXT        NOT NULL,
    full_name     TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- brands
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brands (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
);

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
);

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    name        TEXT           NOT NULL,
    description TEXT           NOT NULL,
    price       NUMERIC(10,2)  NOT NULL CHECK (price >= 0),
    image_url   TEXT           NOT NULL,
    stock       INT            NOT NULL DEFAULT 0 CHECK (stock >= 0),
    brand_id    INT            REFERENCES brands(id),
    category_id INT            REFERENCES categories(id),
    -- Enables ON CONFLICT (name, brand_id) DO NOTHING guards during seeding.
    CONSTRAINT products_name_brand_uniq UNIQUE (name, brand_id)
);

-- ----------------------------------------------------------------------------
-- carts (one active cart per user)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carts (
    id         SERIAL PRIMARY KEY,
    user_id    INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- cart_items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
    id         SERIAL PRIMARY KEY,
    cart_id    INT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    quantity   INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    CONSTRAINT cart_items_cart_product_uniq UNIQUE (cart_id, product_id)
);

-- ----------------------------------------------------------------------------
-- orders
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id               SERIAL PRIMARY KEY,
    user_id          INT           REFERENCES users(id),
    total            NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    status           TEXT          NOT NULL DEFAULT 'pending',
    shipping_name    TEXT,
    shipping_address TEXT,
    shipping_city    TEXT,
    shipping_zip     TEXT,
    shipping_email    TEXT,
    shipping_phone    TEXT,
    shipping_country  TEXT,
    shipping_lat      NUMERIC(10,7),
    shipping_lng      NUMERIC(10,7),
    shipping_place_id TEXT,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- order_items (line items snapshot product name/price at purchase time)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id           SERIAL PRIMARY KEY,
    order_id     INT           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id   INT           REFERENCES products(id),
    product_name TEXT          NOT NULL,
    unit_price   NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    quantity     INT           NOT NULL CHECK (quantity > 0)
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Filtering by brand / category (catalog browsing + faceted filters).
CREATE INDEX IF NOT EXISTS idx_products_brand_id    ON products (brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id);

-- Trigram index for fast, index-backed ILIKE '%term%' name search.
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
    ON products USING gin (name gin_trgm_ops);

-- Common access patterns for cart / order lookups.
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id  ON cart_items (cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id      ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
