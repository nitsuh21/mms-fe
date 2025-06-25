'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/authService';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  auth_provider?: string;
  has_password?: boolean;
  role: 'PA' | 'TA' | 'TS' | 'CU';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
}

const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored user data and tokens on mount
    const storedUser = AuthService.getUser();
    const accessToken = AuthService.getAccessToken();
    if (storedUser && accessToken) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (accessToken: string, userData: User) => {
    AuthService.setTokens({ access: accessToken, refresh: AuthService.getRefreshToken() || '' });
    AuthService.setUser(userData);
    setUser(userData);
  };

  const logout = () => {
    AuthService.clearTokens();
    setUser(null);
    router.push('/auth/signin');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}