// API configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';

// Auth configuration
export const AUTH_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const USER_KEY = 'user';

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/signin',
  REGISTER: '/auth/signup',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  MERCHANT_PORTAL: '/merchant-portal',
};
