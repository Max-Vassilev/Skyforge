import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/" className="brand">
            <img src="/images/logo.png" alt="" className="brand__logo" />
            <span className="brand__name">Skyforge</span>
          </Link>
          <p className="footer__desc">
            Precision-engineered drones and gear for pilots who demand more.
            Built to fly further, shoot sharper, and last longer.
          </p>
        </div>

        <div className="footer__cols">
          <div className="footer__col">
            <span className="footer__col-title">Shop</span>
            <Link className="footer__link" to="/shop?category=camera-drones">
              Camera Drones
            </Link>
            <Link className="footer__link" to="/shop?category=fpv-drones">
              FPV Drones
            </Link>
            <Link className="footer__link" to="/shop?category=accessories">
              Accessories
            </Link>
            <Link className="footer__link" to="/shop">
              All Products
            </Link>
          </div>

          <div className="footer__col">
            <span className="footer__col-title">Company</span>
            <Link className="footer__link" to="/">
              About
            </Link>
            <Link className="footer__link" to="/">
              Careers
            </Link>
            <Link className="footer__link" to="/">
              Contact
            </Link>
          </div>

          <div className="footer__col">
            <span className="footer__col-title">Support</span>
            <Link className="footer__link" to="/orders">
              Orders
            </Link>
            <Link className="footer__link" to="/">
              Shipping
            </Link>
            <Link className="footer__link" to="/">
              Returns
            </Link>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <span>&copy; Skyforge</span>
        <span className="footer-muted">Fly further. Shop smarter.</span>
      </div>
    </footer>
  );
}
