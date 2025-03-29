import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_URL } from '@/config';
import { AuthService } from './authService';

const API_BASE_URL = API_URL || 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable sending cookies with requests
  withCredentials: true
});

// Extract tenant ID from URL path
const extractTenantId = () => {
  const path = window.location.pathname;
  const match = path.match(/\/merchant-portal\/(\d+)\/platform/);
  return match ? match[1] : null;
};

// Request interceptor for auth token and tenant ID
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = AuthService.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tenant ID to requests that require it
    const tenantId = extractTenantId();
    if (tenantId && config.headers) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = AuthService.getRefreshToken();
        if (!refreshToken) {
          throw new Error('Refresh token not found');
        }

        const response = await api.post<{ access: string }>(
          '/auth/token/refresh/',
          { refresh: refreshToken }
        );

        AuthService.setTokens({
          access: response.data.access,
          refresh: refreshToken
        });
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        AuthService.clearTokens();
        window.location.href = '/auth/signin';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Custom error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response) {
      // Handle different error statuses
      switch (response.status) {
        case 401:
          AuthService.clearTokens();
          window.location.href = '/auth/signin';
          break;
        case 403:
          throw new Error('Access denied');
        case 404:
          throw new Error('Resource not found');
        default:
          throw new Error(response.data?.detail || 'An error occurred');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
