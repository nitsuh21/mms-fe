// Local storage keys
export const AUTH_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const USER_KEY = 'user';
export const MERCHANT_KEY = 'merchant';

// Routes
export const ROUTES = {
    HOME: '/',
    SIGN_IN: '/auth/signin',
    SIGN_UP: '/auth/signup',
    PASSWORD_RESET: '/auth/password-reset',
    PASSWORD_RESET_CONFIRM: '/auth/password-reset/confirm',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    MERCHANT_PORTAL: '/merchant-portal',
    MERCHANT_DASHBOARD: (merchantId: number) => `/merchant-portal/${merchantId}/dashboard`,
    BUSINESSES: (merchantId: number) => `/merchant-portal/${merchantId}/businesses`,
    BUSINESS_DETAILS: (merchantId: number, businessId: number) => `/merchant-portal/${merchantId}/businesses/${businessId}`,
    BUSINESS_MEMBERS: (merchantId: number, businessId: number) => `/merchant-portal/${merchantId}/businesses/${businessId}/members`,
};
