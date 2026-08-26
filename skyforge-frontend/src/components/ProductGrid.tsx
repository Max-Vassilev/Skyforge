import type { Product } from '../types';
import { Skeleton } from './ui';
import ProductCard from './ProductCard';

export interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

const SKELETON_COUNT = 8;

export default function ProductGrid({ products, loading = false }: ProductGridProps) {
  if (loading) {
    return (
      <div className="product-grid">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <Skeleton key={i} height={320} radius="var(--radius-lg)" />
        ))}
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
