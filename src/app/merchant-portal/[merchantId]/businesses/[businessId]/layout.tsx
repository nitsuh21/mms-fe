"use client";

import { useParams } from 'next/navigation';
import { AuthProvider } from '@/lib/auth/rbac';

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const businessId = params?.businessId as string | undefined;
  
  // Get the actual business ID from the URL-friendly name
  // This is a temporary solution until we implement business IDs in the backend
  const getActualBusinessId = (urlFriendlyName: string) => {
    // Map URL-friendly names to business IDs
    const businessMap: Record<string, string> = {
      'fitness-studio': '1',
      'yoga-center': '2',
      'dance-academy': '3',
    };
    
    return businessMap[urlFriendlyName] || urlFriendlyName;
  };
  
  const actualBusinessId = businessId ? getActualBusinessId(businessId) : undefined;

  return (
    <AuthProvider role="business_admin" businessId={actualBusinessId}>
      {children}
    </AuthProvider>
  );
}
