"use client";

import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import { AuthProvider } from '@/lib/auth/rbac';
import { NotificationProvider } from '@/context/NotificationContext';

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider role="business_admin" businessId="123">
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
              <Header />
              <main>
                <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}
