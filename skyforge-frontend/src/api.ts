import axios, { AxiosInstance } from 'axios';
import {
  AuthResponse,
  Brand,
  Category,
  Product,
  Paginated,
  Cart,
  Order,
  User,
} from './types';

const BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000/api';

export const TOKEN_KEY = 'drone_shop_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token from localStorage on every request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear token and redirect to /login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
      sessionStorage.removeItem('skyforge_checkout_data');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

/* ------------------------------------------------------------------ */
/* Types for request payloads                                          */
/* ------------------------------------------------------------------ */

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

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

export interface CheckoutPayload {
  shipping_name: string;
  shipping_address: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_country: string;
  shipping_city: string;
  shipping_zip: string;
  shipping_lat: number;
  shipping_lng: number;
  shipping_place_id: string;
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>('/auth/me');
  return data;
};

/* ------------------------------------------------------------------ */
/* Brands & Categories                                                 */
/* ------------------------------------------------------------------ */

export const getBrands = async (): Promise<Brand[]> => {
  const { data } = await api.get<Brand[]>('/brands');
  return data;
};

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[]>('/categories');
  return data;
};

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export const getProducts = async (
  query: ProductQuery = {}
): Promise<Paginated<Product>> => {
  const { data } = await api.get<Paginated<Product>>('/products', { params: query });
  return data;
};

export const getProduct = async (id: number | string): Promise<Product> => {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
};

/* ------------------------------------------------------------------ */
/* Cart                                                                */
/* ------------------------------------------------------------------ */

export const getCart = async (): Promise<Cart> => {
  const { data } = await api.get<Cart>('/cart');
  return data;
};

export const addToCart = async (
  productId: number,
  quantity = 1
): Promise<Cart> => {
  const { data } = await api.post<Cart>('/cart/items', {
    product_id: productId,
    quantity,
  });
  return data;
};

export const updateCartItem = async (
  itemId: number,
  quantity: number
): Promise<Cart> => {
  const { data } = await api.put<Cart>(`/cart/items/${itemId}`, { quantity });
  return data;
};

export const removeCartItem = async (itemId: number): Promise<Cart> => {
  const { data } = await api.delete<Cart>(`/cart/items/${itemId}`);
  return data;
};

export const clearCart = async (): Promise<Cart> => {
  const { data } = await api.delete<Cart>('/cart');
  return data;
};

/* ------------------------------------------------------------------ */
/* Checkout & Orders                                                   */
/* ------------------------------------------------------------------ */

export const checkout = async (payload: CheckoutPayload): Promise<Order> => {
  const { data } = await api.post<Order>('/checkout', payload);
  return data;
};

export const getOrders = async (): Promise<Order[]> => {
  const { data } = await api.get<Order[]>('/orders');
  return data;
};

export const getOrder = async (id: number | string): Promise<Order> => {
  const { data } = await api.get<Order>(`/orders/${id}`);
  return data;
};
