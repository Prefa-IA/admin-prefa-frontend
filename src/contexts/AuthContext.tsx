import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

interface User {
  _id: string;
  email: string;
  role: string;
  isSuperAdmin?: boolean;
  adminRole?: string | null;
  permissions?: string[];
  token: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return true;
    const payload = JSON.parse(atob(parts[1]?.replace(/-/g, '+').replace(/_/g, '/') || ''));
    const exp = typeof payload.exp === 'number' ? payload.exp : 0;
    return !exp || Date.now() >= exp * 1000;
  } catch {
    return true;
  }
};

const loadUserFromStorage = async (): Promise<User | null> => {
  const stored = localStorage.getItem('adminUser');
  if (!stored) return null;

  const parsed: User = JSON.parse(stored);
  if (!parsed.token || isTokenExpired(parsed.token)) {
    localStorage.removeItem('adminUser');
    return null;
  }

  axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
  try {
    const response = await axios.get<{
      _id: string;
      email: string;
      role: string;
      isSuperAdmin?: boolean;
      adminRole?: string | null;
      permissions?: string[];
      [key: string]: unknown;
    }>('/auth/perfil');
    const updatedUser = {
      ...parsed,
      ...response.data,
      token: parsed.token,
    } as User;
    localStorage.setItem('adminUser', JSON.stringify(updatedUser));
    return updatedUser;
  } catch {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('adminUser');
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('adminUser');
  };

  useEffect(() => {
    void loadUserFromStorage().then((loadedUser) => {
      setUser(loadedUser);
      setLoading(false);
    });

    const resInterceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          const url = err.config?.url || '';
          if (url.includes('/auth/')) logout();
        }
        return Promise.reject(err);
      }
    );

    return () => {
      axios.interceptors.response.eject(resInterceptor);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const enc = new TextEncoder().encode(password);
      const buf = await crypto.subtle.digest('SHA-256', enc);
      const hashHex = Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const res = await axios.post('/admin/auth/login', { email, password: hashHex });
      const { token, usuario } = res.data;
      const fullUser = { ...usuario, token } as User;
      setUser(fullUser);
      localStorage.setItem('adminUser', JSON.stringify(fullUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      toast.success('¡Bienvenido de nuevo!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const mensaje = err.response?.data?.error || 'Error al iniciar sesión';
      toast.error(mensaje);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
