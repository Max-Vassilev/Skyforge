import api from './client';
import type { Order } from '../types';

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
