import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Brand, Category, Paginated, Product } from '../types';
import { getBrands, getCategories, getProducts } from '../api';
import type { ProductQuery } from '../api';
import { Alert, Button, EmptyState } from '../components/ui';
import Filters from '../components/Filters';
import type { FilterValues } from '../components/Filters';
import ProductGrid from '../components/ProductGrid';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 12;
const FILTER_KEYS = ['search', 'brand', 'category', 'min_price', 'max_price', 'sort'] as const;

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<Paginated<Product> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Read the current filter/pagination state straight from the URL.
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const values: FilterValues = {
    search: searchParams.get('search') ?? undefined,
    brand: searchParams.get('brand') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    min_price: searchParams.get('min_price') ?? undefined,
    max_price: searchParams.get('max_price') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
  };

  // Load brands & categories once.
  useEffect(() => {
    let active = true;
    Promise.all([getBrands(), getCategories()])
      .then(([b, c]) => {
        if (!active) return;
        setBrands(b);
        setCategories(c);
      })
      .catch(() => {
        /* filters degrade gracefully if these fail */
      });
    return () => {
      active = false;
    };
  }, []);

  // Refetch products whenever the URL params change.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const query: ProductQuery = { page, page_size: PAGE_SIZE };
    const search = searchParams.get('search');
    const brand = searchParams.get('brand');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const sort = searchParams.get('sort');
    if (search) query.search = search;
    if (brand) query.brand = brand;
    if (category) query.category = category;
    if (minPrice) query.min_price = Number(minPrice);
    if (maxPrice) query.max_price = Number(maxPrice);
    if (sort) query.sort = sort;

    getProducts(query)
      .then((res) => {
        if (active) setData(res);
      })
      .catch(() => {
        if (active) setError('Something went wrong loading products. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [searchParams, page]);

  // Merge a filter patch into the URL and reset to page 1.
  const handleFilterChange = (patch: Record<string, string>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(patch)) {
        if (value === '' || value == null) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      next.delete('page');
      return next;
    });
  };

  const handleClear = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const key of FILTER_KEYS) next.delete(key);
      next.delete('page');
      return next;
    });
  };

  const handlePageChange = (nextPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextPage <= 1) next.delete('page');
      else next.set('page', String(nextPage));
      return next;
    });
  };

  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 0;
  const products = data?.items ?? [];
  const hasResults = loading || products.length > 0;

  return (
    <div className="catalog">
      <div className="catalog__layout">
        <div className="catalog__sidebar">
          <Filters
            brands={brands}
            categories={categories}
            values={values}
            onChange={handleFilterChange}
            onClear={handleClear}
          />
        </div>

        <div className="catalog__main">
          <div className="catalog__toolbar">
            <span className="catalog__count">
              {loading
                ? 'Loading products…'
                : `${total} product${total === 1 ? '' : 's'}`}
            </span>
          </div>

          {error != null ? (
            <Alert variant="error">{error}</Alert>
          ) : hasResults ? (
            <>
              <ProductGrid products={products} loading={loading} />
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={handlePageChange}
              />
            </>
          ) : (
            <EmptyState
              title="No products found"
              message="Try adjusting or clearing your filters to see more results."
              action={
                <Button variant="outline" onClick={handleClear}>
                  Clear filters
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
