"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved session in localStorage on mount
    const savedToken = localStorage.getItem('thirai_jwt');
    const savedUser = localStorage.getItem('thirai_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (emailOrUsername, password) => {
    const res = await api.post('/auth/login', {
      email: emailOrUsername,
      password
    });

    if (res.data.success) {
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('thirai_jwt', token);
      localStorage.setItem('thirai_user', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, error: 'Login failed' };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('thirai_jwt');
    localStorage.removeItem('thirai_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
