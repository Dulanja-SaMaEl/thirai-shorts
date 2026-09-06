import axios from 'axios';

// Normalize API URL: strip trailing slash, ensure it ends with /api
let rawUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').trim();
rawUrl = rawUrl.replace(/\/+$/, '');
if (!rawUrl.endsWith('/api')) {
  rawUrl = `${rawUrl}/api`;
}

const api = axios.create({
  baseURL: rawUrl,
  timeout: 35000, // 35s to account for Render free tier spindown wake-ups
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach auth JWT token if logged in
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('thirai_jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
