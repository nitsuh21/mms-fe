"use client";

import { Header, Sidebar } from "@/components/shared";
import { AuthProvider } from '@/lib/auth/rbac';
import { NotificationProvider } from '@/context/NotificationContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { useParams } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function MerchantIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const merchantId = params.merchantId as string;

  const queryClient = new QueryClient();

  return (
    <NotificationProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider role="merchant_admin" merchantId={merchantId}>
        <SidebarProvider>
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
        </SidebarProvider>
        </AuthProvider>
      </QueryClientProvider>
    </NotificationProvider>
  );
}
