import { UserData, AuthResponse } from '@/types/auth';
import api from './api';

export class AuthService {
  static setTokens(tokens: { access: string; refresh: string }) {
    localStorage.setItem('accessToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
  }

  static getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  static getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  static setUser(user: UserData) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  static getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  static async signIn(credentials: { email: string; password: string }): Promise<AuthResponse> {
    try {
      this.clearTokens();
      const response = await api.post('/auth/signin/', credentials);
      
      // Store tokens and user info
      this.setTokens({
        access: response.data.access,
        refresh: response.data.refresh
      });
      this.setUser(response.data.user);
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Sign in failed');
    }
  }

  static async signUp(userData: {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
  }): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/signup/', userData);
      
      // Store tokens and user info
      AuthService.setTokens({
        access: response.data.access,
        refresh: response.data.refresh
      });
      AuthService.setUser(response.data.user);
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Sign up failed');
    }
  }

  static getCurrentUser(): UserData | null {
    return AuthService.getUser();
  }

  static async logout() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (refreshToken) {
        // Try to refresh token first to make sure we have a valid access token
        await this.refreshToken();
        
        // Now use the access token to sign out
        const response = await api.post('/auth/signout/', {}, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        });
        console.log('Logout successful:', response.data);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  static getGoogleAuthUrl(): string {
    return `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/?redirect_uri=${encodeURIComponent(
      window.location.origin + '/auth/callback/google'
    )}`;
  }

  static async handleGoogleCallback(code: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/google/', { 
        code,
        redirect_uri: window.location.origin + '/auth/callback/google'
      });
      
      // Store tokens and user info
      AuthService.setTokens({
        access: response.data.access,
        refresh: response.data.refresh
      });
      AuthService.setUser(response.data.user);
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Google sign in failed');
    }
  }

  static async refreshToken(): Promise<{ access: string }> {
    const refreshToken = AuthService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    try {
      const response = await api.post('/auth/token/refresh/', {
        refresh: refreshToken
      });
      
      // Update access token
      AuthService.setTokens({
        access: response.data.access,
        refresh: refreshToken
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Token refresh failed');
    }
  }
}
