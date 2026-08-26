import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import api, { getToken, setToken, clearToken } from '../api';
import type { AuthResponse, User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  register: (email: string, password: string, full_name: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [loading, setLoading] = useState<boolean>(true);

  const persistToken = (value: string | null) => {
    if (value) {
      setToken(value);
    } else {
      clearToken();
    }
    setTokenState(value);
  };

  // On mount: if a token exists, hydrate the user from /auth/me.
  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      const stored = getToken();
      if (!stored) {
        if (active) setLoading(false);
        return;
      }
      try {
        const { data } = await api.get<User>('/auth/me');
        if (active) setUser(data);
      } catch {
        // Token is invalid/expired — clear it.
        if (active) {
          persistToken(null);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void hydrate();
    return () => {
      active = false;
    };
  }, []);

  const register = async (
    email: string,
    password: string,
    full_name: string,
  ): Promise<User> => {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      full_name,
    });
    persistToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const login = async (email: string, password: string): Promise<User> => {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    persistToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Best-effort: ignore server-side logout failures.
    } finally {
      sessionStorage.removeItem('skyforge_checkout_data');
      persistToken(null);
      setUser(null);
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
