'use client'

import { useParams } from 'next/navigation';
import MembershipRequests from '@/components/MembershipRequests';

export default function MembershipRequestsPage() {
  const params = useParams();
  const businessId = params?.businessId as string;

  if (!businessId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Business ID is missing</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Membership Requests
        </h1>
      </div>
      
      <MembershipRequests businessId={businessId} />
    </div>
  );
}