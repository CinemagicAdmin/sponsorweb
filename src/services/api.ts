import axios from 'axios';
import { config } from '@/config/env';
import { storage } from '@/utils/storage';

const api = axios.create({
  baseURL: config.apiUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach access token to every request
api.interceptors.request.use((req) => {
  const token = storage.getAccessToken();
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Handle 401 – try token refresh once
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  pendingQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = storage.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${config.apiUrl}/auth/refresh`, {
          refreshToken,
        });

        const newToken = data.data.token;
        const newRefresh = data.data.refreshToken;
        storage.setAccessToken(newToken);
        storage.setRefreshToken(newRefresh);

        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        storage.clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 429 – auto-retry once after delay
    if (error.response?.status === 429 && !original._rateLimitRetry) {
      original._rateLimitRetry = true;
      const retryAfter = Number(error.response.headers['retry-after']) || 5;
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return api(original);
    }

    return Promise.reject(error);
  },
);

export default api;
