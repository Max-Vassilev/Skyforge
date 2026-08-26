import api from './client';
import type { Cart } from '../types';

export const getCart = async (): Promise<Cart> => {
  const { data } = await api.get<Cart>('/cart');
  return data;
};

export const addToCart = async (productId: number, quantity = 1): Promise<Cart> => {
  const { data } = await api.post<Cart>('/cart/items', { product_id: productId, quantity });
  return data;
};

export const updateCartItem = async (itemId: number, quantity: number): Promise<Cart> => {
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
