import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import SearchBar from '../SearchBar';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { count } = useCart();

  const firstName = user?.full_name?.trim().split(/\s+/)[0] ?? '';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__brand">
          <Link to="/" className="brand">
            <img src="/images/logo.png" alt="" className="brand__logo" />
            <span className="brand__name">Skyforge</span>
          </Link>
        </div>

        <SearchBar />

        <nav className="navbar__nav">
          <NavLink
            to="/shop"
            className={({ isActive }) =>
              isActive ? 'navlink navlink--active' : 'navlink'
            }
          >
            Shop
          </NavLink>
        </nav>

        <div className="navbar__actions">
          <Link
            to="/cart"
            className="cartlink"
            aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && (
              <span className="cartlink__badge" aria-hidden="true">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="navbar__user">
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  isActive ? 'navlink navlink--active' : 'navlink'
                }
              >
                {firstName}&rsquo;s orders
              </NavLink>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          ) : (
            <div className="navbar__user">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? 'navlink navlink--active' : 'navlink'
                }
              >
                Log in
              </NavLink>
              <Button variant="primary" size="sm" to="/register">
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
