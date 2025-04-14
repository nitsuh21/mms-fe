// mms-fe/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserData, AuthResponse } from '@/types/auth';
import { AuthService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
  }) => Promise<AuthResponse | undefined>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = AuthService.getUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        AuthService.clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await AuthService.signIn(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Redirect to the user's platform dashboard
      if (response.user?.id) {
        router.push(`/merchant-portal/${response.user.id}/platform/dashboard`);
      } else {
        router.push('/merchant-portal/');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/auth/signin');
  };

  const signup = async (userData: {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
  }): Promise<AuthResponse | undefined> => {
    try {
      const response = await AuthService.signUp(userData);
      if (response?.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
      }
      return undefined;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Add token refresh interceptor
  useEffect(() => {
    const refreshInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const { access } = await AuthService.refreshToken();
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return axios(originalRequest);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            AuthService.clearTokens();
            router.push('/auth/signin');
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(refreshInterceptor);
    };
  }, [router]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      signup
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}