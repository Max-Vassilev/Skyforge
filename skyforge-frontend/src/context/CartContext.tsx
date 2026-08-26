import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import api, { getToken } from '../api';
import type { Cart } from '../types';
import { useAuth } from './AuthContext';

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  count: number;
  subtotal: number;
  refresh: () => Promise<void>;
  addItem: (productId: number, qty?: number) => Promise<void>;
  updateItem: (itemId: number, qty: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Only talk to the API when the user is authenticated.
  const isAuthenticated = () => user !== null && !!getToken();

  const refresh = useCallback(async (): Promise<void> => {
    if (!isAuthenticated()) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get<Cart>('/cart');
      setCart(data);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addItem = useCallback(
    async (productId: number, qty: number = 1): Promise<void> => {
      if (!isAuthenticated()) return;
      const { data } = await api.post<Cart>('/cart/items', {
        product_id: productId,
        quantity: qty,
      });
      setCart(data);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  const updateItem = useCallback(
    async (itemId: number, qty: number): Promise<void> => {
      if (!isAuthenticated()) return;
      const { data } = await api.put<Cart>(`/cart/items/${itemId}`, {
        quantity: qty,
      });
      setCart(data);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  const removeItem = useCallback(
    async (itemId: number): Promise<void> => {
      if (!isAuthenticated()) return;
      const { data } = await api.delete<Cart>(`/cart/items/${itemId}`);
      setCart(data);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  const clear = useCallback(async (): Promise<void> => {
    if (!isAuthenticated()) {
      setCart(null);
      return;
    }
    await api.delete('/cart');
    setCart({ items: [], subtotal: 0, count: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Refresh the cart whenever the authenticated user changes.
  useEffect(() => {
    if (user) {
      void refresh();
    } else {
      setCart(null);
    }
  }, [user, refresh]);

  const count = useMemo(
    () => cart?.count ?? cart?.items.reduce((n, i) => n + i.quantity, 0) ?? 0,
    [cart],
  );

  const subtotal = useMemo(
    () =>
      cart?.subtotal ??
      cart?.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0) ??
      0,
    [cart],
  );

  const value: CartContextValue = {
    cart,
    loading,
    count,
    subtotal,
    refresh,
    addItem,
    updateItem,
    removeItem,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (ctx === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
