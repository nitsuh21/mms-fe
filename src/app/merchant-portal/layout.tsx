"use client";

import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MerchantLayoutContent>
          {children}
        </MerchantLayoutContent>
      </NotificationProvider>
    </AuthProvider>
  );
}

function MerchantLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/signin');
    return null;
  }

  // Check if user has proper role
  // if (user?.role !== 'PA' && user?.role !== 'TA') {
  //   router.push('/auth/signin');
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
      {children}
    </div>
  );
}
