// mms-fe/src/services/authService.ts
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

  static getUser(): UserData | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  static async signIn(credentials: { email: string; password: string; remember_me?: boolean }): Promise<{ require_otp: boolean; email: string; message?: string }> {
    try {
      this.clearTokens();
      const response = await api.post('/auth/signin/', credentials);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;
        console.error('Sign in error response:', { status, data: JSON.stringify(data, null, 2) });
        if (status === 401) {
          throw new Error(data?.detail || 'Invalid email or password. Please try again.');
        } else if (status === 403) {
          throw new Error('Your account is locked. Please contact support.');
        } else if (status === 400 && data?.error) {
          throw new Error(data.error);
        } else {
          throw new Error('Unable to sign in. Please try again later.');
        }
      }
      console.error('No response in error, likely network issue');
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  static async verifyOTP(email: string, otp: string, purpose: string = 'login'): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/verify-otp/', { email, otp, purpose });
      const { access, refresh, user } = response.data;
      this.setTokens({ access, refresh });
      this.setUser(user);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;
        console.error('Verify OTP error response:', { status, data: JSON.stringify(data, null, 2) });
        if (status === 400) {
          throw new Error('Invalid or expired OTP. Please try again.');
        } else if (status === 404) {
          throw new Error('No account found with this email address.');
        } else if (data?.error) {
          throw new Error(data.error);
        } else {
          throw new Error('Unable to verify OTP. Please try again later.');
        }
      }
      console.error('No response in error, likely network issue');
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  static async resendOTP(email: string, purpose: string): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/resend-otp/', { email , purpose });
      return { message: response.data.message || 'New OTP sent to your email.' };
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;
        console.error('Resend OTP error response:', { status, data: JSON.stringify(data, null, 2) });
        if (status === 404) {
          throw new Error('No account found with this email address.');
        } else if (status === 429) {
          throw new Error('Too many requests. Please wait before trying again.');
        } else if (status === 400 && data?.error) {
          throw new Error(data.error);
        } else {
          throw new Error('Unable to resend OTP. Please try again later.');
        }
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  static async signUp(userData: {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
    business_name?: string;
  }): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/signup/', userData);
      const { access, refresh, user } = response.data;
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;
        console.error('Sign up error response:', { status, data: JSON.stringify(data, null, 2) });
        if (status === 400 || status === 409) {
          if (data?.email && Array.isArray(data.email) && data.email.length > 0) {
            throw new Error(data.email[0]);
          }
          if (data?.error && typeof data.error === 'string') {
            if (data.error.toLowerCase().includes('email')) {
              throw new Error('This email is already registered.');
            } else if (data.error.toLowerCase().includes('password')) {
              throw new Error('Password must be at least 8 characters, include an uppercase letter and a number.');
            } else {
              throw new Error(data.error);
            }
          }
          throw new Error('Invalid data provided. Please check your input.');
        } else if (status === 422) {
          throw new Error('Invalid data provided. Please check your input.');
        } else if (status === 429) {
          throw new Error('Too many sign-up attempts. Please try again later.');
        } else {
          throw new Error(`Server error (${status}). Please try again later.`);
        }
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  static getCurrentUser(): UserData | null {
    return this.getUser();
  }

  static async logout() {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await api.post('/auth/signout', {}, {
          headers: { 'Authorization': `Bearer ${this.getAccessToken()}` },
          withCredentials: true,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  static getGoogleAuthUrl(): string {
    return `${process.env.NEXT_PUBLIC_API_URL}/auth/google?redirect_uri=${encodeURIComponent(
      window.location.origin + '/auth/callback/google'
    )}`;
  }

  static async updateProfile(data: any): Promise<UserData> {
    try {
      const response = await api.patch('/auth/profile', data, {
        headers: { 'Authorization': `Bearer ${this.getAccessToken()}` },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to update profile');
    }
  }

  static async handleGoogleCallback(code: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/google', { 
        code,
        redirect_uri: window.location.origin + '/auth/callback/google'
      });
      const { access, refresh, user } = response.data;
      this.setTokens({ access, refresh });
      this.setUser(user);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Google sign in failed');
    }
  }

  static async refreshToken(): Promise<{ access: string }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    try {
      const response = await api.post('/auth/token/refresh', { refresh: refreshToken });
      this.setTokens({ access: response.data.access, refresh: refreshToken });
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Token refresh failed');
    }
  }

  static async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/password-reset/', { email });
      return { message: response.data.message || 'Password reset OTP sent to your email.' };
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 404) {
          throw new Error('No account found with this email address.');
        } else if (status === 400 && data?.error) {
          throw new Error(data.error);
        } else {
          throw new Error('Unable to send password reset OTP. Please try again later.');
        }
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  static async resetPassword(data: { email: string; password: string; confirm_password: string; token?: string }): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/reset-password/', data);
      return { message: response.data.message || 'Password reset successfully.' };
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          if (data?.error.includes('password')) {
            throw new Error('Password does not meet requirements. Must be at least 8 characters.');
          } else if (data?.error.includes('confirm_password')) {
            throw new Error('Passwords do not match.');
          } else if (data?.error.includes('token')) {
            throw new Error('Invalid or expired reset token. Please request a new OTP.');
          } else {
            throw new Error(data.error || 'Unable to reset password. Please try again.');
          }
        } else if (status === 404) {
          throw new Error('No account found with this email address.');
        } else {
          throw new Error('Unable to reset password. Please try again later.');
        }
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }
}