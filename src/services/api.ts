import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthService } from './authService';

// API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Ensure the API URL ends with a slash
const normalizedApiUrl = API_BASE_URL.endsWith('/') 
  ? API_BASE_URL + 'api/'
  : API_BASE_URL + '/api/';

const api = axios.create({
  baseURL: normalizedApiUrl,
  headers: {
    'Content-Type': 'application/json','Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  },
  // Enable sending cookies with requests
  withCredentials: false,
  timeout: 10000,
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
