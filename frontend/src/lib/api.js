import axios from 'axios';

// Normalize API URL: strip trailing slash, ensure it ends with /api
let rawUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').trim();
rawUrl = rawUrl.replace(/\/+$/, '');
if (!rawUrl.endsWith('/api')) {
  rawUrl = `${rawUrl}/api`;
}

const api = axios.create({
  baseURL: rawUrl,
  timeout: 60000, // 60s timeout to comfortably accommodate Render free tier cold-start wakeups
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach auth JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('thirai_jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Seamless single-retry on cold-start timeouts or 502/503/504 gateways
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Don't retry if already retried or config missing
    if (!config || config._retry) {
      return Promise.reject(error);
    }

    const isNetworkOrTimeout = 
      error.code === 'ECONNABORTED' || 
      !error.response || 
      error.message?.includes('Network Error');
    const isGatewayWakeup = 
      error.response && [502, 503, 504].includes(error.response.status);

    // Auto-retry once for GET requests that fail due to cold-start wakeups
    if ((isNetworkOrTimeout || isGatewayWakeup) && (!config.method || config.method.toUpperCase() === 'GET')) {
      config._retry = true;
      // Wait 2.5 seconds for container to finish binding
      await new Promise((resolve) => setTimeout(resolve, 2500));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
