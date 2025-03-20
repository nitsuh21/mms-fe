"use client";

import { AuthProvider } from '@/lib/auth/rbac';
import { NotificationProvider } from '@/context/NotificationContext';

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider role="business_admin">
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
          {children}
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}
