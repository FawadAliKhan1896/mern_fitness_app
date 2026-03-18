import { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.me()
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const { user: u, token } = await authApi.login({ username, password });
    localStorage.setItem('token', token);
    setUser(u);
    return u;
  };

  const register = async (username, email, password, name) => {
    const { user: u, token } = await authApi.register({ username, email, password, name });
    localStorage.setItem('token', token);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const u = await authApi.update(data);
    setUser(u);
    return u;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
