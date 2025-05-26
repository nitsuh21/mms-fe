import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Handle different error codes here
      if (error.response.status === 401) {
        try {
          // Try to refresh the token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await api.post('/auth/token/refresh/', {
              refresh: refreshToken
            });
            
            // Update access token
            localStorage.setItem('accessToken', response.data.access);
            
            // Retry the original request
            const originalRequest = error.config;
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return api(originalRequest);
          }
        } catch (error) {
          // If refresh fails, clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          console.log(error);
          window.location.href = '/auth/signin';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
