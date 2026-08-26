import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export default function SearchBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [value, setValue] = useState('');

  // Prefill from the current ?search when we are on the shop page.
  useEffect(() => {
    if (location.pathname === '/shop') {
      setValue(searchParams.get('search') ?? '');
    }
  }, [location.pathname, searchParams]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = value.trim();
    navigate(q ? `/shop?search=${encodeURIComponent(q)}` : '/shop');
  };

  return (
    <form className="navbar__search" role="search" onSubmit={handleSubmit}>
      <input
        className="input"
        type="search"
        name="search"
        placeholder="What are you looking for?"
        aria-label="Search products"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}
