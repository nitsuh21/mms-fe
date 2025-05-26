"use client";

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Role, Permission, ROLE_PERMISSIONS } from './types';
import { USER_KEY } from '@/config';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
}

interface AuthContextType {
  role: Role;
  businessId?: string;
  user?: User;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  role,
  businessId,
}: {
  children: ReactNode;
  role: Role;
  businessId?: string;
}) {
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    // Get user from localStorage
    const userStr = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const hasPermission = (permission: Permission): boolean => {
    const rolePermissions = ROLE_PERMISSIONS[role];
    return rolePermissions.some((p: Permission) => p.id === permission.id);
  };

  return (
    <AuthContext.Provider value={{ role, businessId, user, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface WithPermissionProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function WithPermission({ permission, children, fallback = null }: WithPermissionProps) {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}

// HOC for protecting routes
export function withAuth(permission: Permission) {
  return function <P extends object>(WrappedComponent: React.ComponentType<P>) {
    return function WithAuthWrapper(props: P) {
      const { hasPermission } = useAuth();
      
      if (!hasPermission(permission)) {
        // You can replace this with a proper unauthorized component
        return <div>Unauthorized</div>;
      }
      
      return <WrappedComponent {...props} />;
    };
  };
}
