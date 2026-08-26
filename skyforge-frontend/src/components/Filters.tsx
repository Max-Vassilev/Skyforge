import type { ChangeEvent } from 'react';
import type { Brand, Category } from '../types';
import { Button, Input, Select } from './ui';

export interface FilterValues {
  search?: string;
  brand?: string;
  category?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
}

export interface FiltersProps {
  brands: Brand[];
  categories: Category[];
  values: FilterValues;
  onChange: (patch: Record<string, string>) => void;
  onClear: () => void;
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function Filters({
  brands,
  categories,
  values,
  onChange,
  onClear,
}: FiltersProps) {
  const patch = (key: string) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ [key]: e.target.value });

  return (
    <aside className="filters" aria-label="Product filters">
      <div className="filters__group">
        <Select
          label="Category"
          value={values.category ?? ''}
          onChange={patch('category')}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select label="Brand" value={values.brand ?? ''} onChange={patch('brand')}>
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>
              {b.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="filters__group">
        <span className="filters__legend">Price range</span>
        <div className="price-range">
          <div className="price-range__inputs">
            <Input
              type="number"
              min={0}
              placeholder="Min"
              aria-label="Minimum price"
              value={values.min_price ?? ''}
              onChange={patch('min_price')}
            />
            <span className="price-range__sep">&ndash;</span>
            <Input
              type="number"
              min={0}
              placeholder="Max"
              aria-label="Maximum price"
              value={values.max_price ?? ''}
              onChange={patch('max_price')}
            />
          </div>
        </div>
      </div>

      <div className="filters__group">
        <Select label="Sort by" value={values.sort ?? 'name_asc'} onChange={patch('sort')}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="filters__actions">
        <Button variant="ghost" size="sm" block onClick={onClear}>
          Clear filters
        </Button>
      </div>
    </aside>
  );
}
