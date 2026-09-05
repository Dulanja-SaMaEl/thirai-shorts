"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateTokens: () => {},
  refreshUser: async () => {}
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

  const register = async (fullName, email, password) => {
    const res = await api.post('/auth/register', {
      full_name: fullName,
      email,
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
    return { success: false, error: 'Registration failed' };
  };

  const updateTokens = (newBalance) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, tokens_balance: Number(newBalance) };
      localStorage.setItem('thirai_user', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('thirai_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      // Ignore background refresh error
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('thirai_jwt');
    localStorage.removeItem('thirai_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateTokens, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
