import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  email: string;
  role: string;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('adminUser');
    if (stored) {
      const parsed: User = JSON.parse(stored);
      const isTokenExpired = (token: string): boolean => {
        try {
          const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
          const exp = typeof payload.exp === 'number' ? payload.exp : 0;
          return !exp || Date.now() >= exp * 1000;
        } catch {
          return true;
        }
      };

      if (!parsed.token || isTokenExpired(parsed.token)) {
        localStorage.removeItem('adminUser');
      } else {
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
        axios
          .get('/auth/perfil')
          .then(() => setUser(parsed))
          .catch(() => {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('adminUser');
            setUser(null);
          })
          .finally(() => setLoading(false));
      }
    } else {
      setLoading(false);
    }

    const resInterceptor = axios.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401) {
          // Desloguear solo si es un endpoint crítico de auth
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
    setLoading(true);
    const res = await axios.post('/auth/login', { email, password });
    const { token, usuario } = res.data;
    const fullUser = { ...usuario, token } as User;
    setUser(fullUser);
    localStorage.setItem('adminUser', JSON.stringify(fullUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('adminUser');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 