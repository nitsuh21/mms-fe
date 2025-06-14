import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthService } from './authService';

// API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Normalize API URL by removing trailing slash if present
const normalizedApiUrl = API_BASE_URL.endsWith('/') 
  ? API_BASE_URL.slice(0, -1)
  : API_BASE_URL;

console.log('API_BASE_URL', API_BASE_URL);
console.log('normalizedApiUrl', normalizedApiUrl);

const api = axios.create({
  baseURL: `${normalizedApiUrl}/api`,  // Add /api to base URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true, // This is required for cookies/credentials
  timeout: 30000,
});

// Extract tenant ID from URL path
const extractTenantId = () => {
  const path = window.location.pathname;
  const match = path.match(/\/merchant-portal\/(\d+|\w+)\/businesses\/(\d+|\w+)\//);
  return match ? match[1] : null;
};

// Request interceptor for auth token and tenant ID
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Add auth token
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
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        await AuthService.refreshToken();
        
        if (originalRequest.headers) {
          const newAccessToken = AuthService.getAccessToken();
          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        // Clear tokens and redirect
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
          // Don't immediately clear tokens - let the refresh interceptor handle it
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
