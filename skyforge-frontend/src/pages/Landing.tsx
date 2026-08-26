import { useEffect, useState } from 'react';
import { getProducts } from '../api';
import type { Product } from '../types';
import ProductGrid from '../components/ProductGrid';
import { Button, Skeleton } from '../components/ui';
import { useAuth } from '../context/AuthContext';

// One featured product from each of these categories on the landing page.
const FEATURED_CATEGORIES = ['drones', 'controllers', 'chargers', 'propellers-fins'];

export default function Landing() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [prodLoading, setProdLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all(
      FEATURED_CATEGORIES.map((category) =>
        getProducts({ category, page_size: 1 }).then((data) => data.items[0]),
      ),
    )
      .then((items) => {
        if (active) setProducts(items.filter(Boolean) as Product[]);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setProdLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <span className="hero__glow" aria-hidden="true" />
        <div className="hero__inner">
          <div className="hero__content">
            <span className="hero__eyebrow">Aerospace-grade gear</span>
            <h1 className="hero__title">
              Fly further.
            </h1>
            <p className="hero__subtitle">
              Skyforge is your flight deck for premium drones and the parts that keep
              them airborne &mdash; propellers, batteries, chargers, cameras, and
              controllers from the brands you trust, shipped across Europe.
            </p>
            <div className="hero__stats">
              <div className="hero__stat">
                <span className="hero__stat-num">6 brands</span>
                <span className="hero__stat-label">Curated lineup</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-num">50+ products</span>
                <span className="hero__stat-label">In stock</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-num">Shipping</span>
                <span className="hero__stat-label">Across Europe</span>
              </div>
            </div>
          </div>
          <div className="hero__media">
            <img
              src="https://picsum.photos/seed/skyforge-hero/800/600"
              alt="A drone in flight against a clear sky"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="section">
        <div className="section__inner">
          <div className="section__head">
            <div>
              <h2 className="section__title">Explore our products</h2>
            </div>
            <Button to="/shop" variant="primary">
              View all &rarr;
            </Button>
          </div>

          {prodLoading ? (
            <div className="product-grid product-grid--compact">
              {Array.from({ length: 4 }).map((_, i) => (
                <div className="product-card" key={i}>
                  <Skeleton height="0" className="product-card__media" />
                  <div className="product-card__body">
                    <Skeleton width="40%" height="0.75rem" />
                    <Skeleton width="80%" height="1rem" />
                    <Skeleton width="30%" height="1.15rem" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </section>

      {/* Features / trust row */}
      <section className="section">
        <div className="section__inner">
          <div className="features">
            <div className="feature">
              <span className="feature__icon" aria-hidden="true">
                {'\u{1F680}'}
              </span>
              <h3 className="feature__title">Shipping across Europe</h3>
              <p className="feature__text">
                Same-day dispatch on in-stock gear, delivered right across Europe.
              </p>
            </div>
            <div className="feature">
              <span className="feature__icon" aria-hidden="true">
                {'\u{2705}'}
              </span>
              <h3 className="feature__title">Genuine parts</h3>
              <p className="feature__text">
                Only authentic, manufacturer-backed components &mdash; no clones, no
                compromises.
              </p>
            </div>
            <div className="feature">
              <span className="feature__icon" aria-hidden="true">
                {'\u{1F4AC}'}
              </span>
              <h3 className="feature__title">Expert support</h3>
              <p className="feature__text">
                Pilots and builders on the team who actually fly what we sell.
              </p>
            </div>
            <div className="feature">
              <span className="feature__icon" aria-hidden="true">
                {'\u{1F512}'}
              </span>
              <h3 className="feature__title">Secure checkout</h3>
              <p className="feature__text">
                Encrypted payments and buyer protection on every transaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA band — only for signed-out visitors */}
      {!user && (
        <section className="section">
          <div className="section__inner">
            <div className="cta">
              <div className="cta__inner">
                <div>
                  <h2 className="cta__title">Ready for takeoff?</h2>
                  <p className="cta__text">
                    Create a free Skyforge account to track orders, save builds, and check
                    out faster.
                  </p>
                </div>
                <div className="cta__actions">
                  <Button to="/register" variant="primary" size="lg">
                    Create your account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
