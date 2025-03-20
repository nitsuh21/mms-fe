import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_URL } from '@/config';

const API_BASE_URL = API_URL || 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable sending cookies with requests
  withCredentials: true
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post<{ access: string }>(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        localStorage.setItem('accessToken', response.data.access);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token is invalid, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
