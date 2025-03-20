"use client";

import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import { AuthProvider } from '@/lib/auth/rbac';
import { NotificationProvider } from '@/context/NotificationContext';
import { useParams } from 'next/navigation';

export default function MerchantIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const merchantId = params.merchantId as string;

  return (
    <AuthProvider role="merchant_admin" merchantId={merchantId}>
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
    </AuthProvider>
  );
}
