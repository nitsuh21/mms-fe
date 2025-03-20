import api from './api';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, ROUTES, API_URL } from '@/config';
import {
    SignUpData,
    SignInData,
    AuthResponse,
    PasswordResetRequest,
    PasswordResetConfirm,
    TokenRefreshRequest,
    TokenRefreshResponse
} from '@/types/auth';

export const authService = {
    signUp: async (data: SignUpData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/signup/', data);
        return response.data;
    },

    signIn: async (data: SignInData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/signin/', data);
        return response.data;
    },

    signout: async (): Promise<AuthResponse> => {
        try {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
            if (!refreshToken) {
                // If no refresh token, just clear local storage
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
                return { success: true, message: 'Logged out successfully' } as any;
            }
            
            const response = await api.post<AuthResponse>('/auth/signout/', { refresh: refreshToken });
            
            // Clear local storage
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            
            return response.data;
        } catch (error) {
            // Even if the API call fails, we should still clear local storage
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            
            console.error('Error during logout:', error);
            throw error;
        }
    },

    refreshToken: async (data: TokenRefreshRequest): Promise<TokenRefreshResponse> => {
        const response = await api.post<TokenRefreshResponse>('/auth/token/refresh/', data);
        return response.data;
    },

    requestPasswordReset: async (data: PasswordResetRequest): Promise<void> => {
        await api.post('/auth/password-reset/', data);
    },

    resetPassword: async (uidb64: string, token: string, data: PasswordResetConfirm): Promise<void> => {
        await api.post(`/auth/password-reset/${uidb64}/${token}/`, {
            password: data.password,
            confirm_password: data.confirm_password
        });
    },

    // Social auth URLs
    getGoogleAuthUrl: (): string => {
        return `${API_URL}/auth/social-auth/google-oauth2/`;
    },

    getTwitterAuthUrl: (): string => {
        return `${API_URL}/auth/social-auth/twitter/`;
    },

    // User profile management
    getCurrentUser: async (): Promise<any> => {
        try {
            const response = await api.get('/auth/me/');
            return response.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    updateProfile: async (profileData: any) => {
        try {
            const response = await api.post('/auth/profile/update/', profileData);
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }
};
