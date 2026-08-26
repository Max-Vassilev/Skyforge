import api from './client';
import type { Brand, Category, Paginated, Product } from '../types';

export interface ProductQuery {
  page?: number;
  page_size?: number;
  search?: string;
  brand?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
}

export const getBrands = async (): Promise<Brand[]> => {
  const { data } = await api.get<Brand[]>('/brands');
  return data;
};

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[]>('/categories');
  return data;
};

export const getProducts = async (query: ProductQuery = {}): Promise<Paginated<Product>> => {
  const { data } = await api.get<Paginated<Product>>('/products', { params: query });
  return data;
};

export const getProduct = async (id: number | string): Promise<Product> => {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
};
