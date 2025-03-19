"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { Role, Permission, ROLE_PERMISSIONS } from './types';

interface AuthContextType {
  role: Role;
  businessId?: string;
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
  const hasPermission = (permission: Permission): boolean => {
    const rolePermissions = ROLE_PERMISSIONS[role];
    return rolePermissions.some(p => p.id === permission);
  };

  return (
    <AuthContext.Provider value={{ role, businessId, hasPermission }}>
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
