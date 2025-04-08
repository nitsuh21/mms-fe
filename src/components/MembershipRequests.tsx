'use client'

import { useState, useEffect } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { MembershipRequest, MembershipRequestFilter } from '@/services/customerService';
import { customerService } from '@/services/customerService';

interface MembershipRequestsProps {
  businessId: string;
}

export default function MembershipRequests({ businessId }: MembershipRequestsProps) {
  const [requests, setRequests] = useState<MembershipRequest[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotification();

  const loadRequests = async () => {
    try {
      const filters: MembershipRequestFilter = {
        // type: 'SYNC',
        // status: 'PENDING'
      };
      const response = await customerService.getMembershipRequests(businessId, filters);
      console.log("here is response", response)
      setRequests(response);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load membership requests:", error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load membership requests. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    try {
      await customerService.approveMembershipRequest(businessId, requestId);
      loadRequests(); // Refresh requests list
      addNotification({
        type: 'success',
        title: 'Request Approved',
        message: 'Membership request has been successfully approved.',
      });
    } catch (error) {
      console.error('Failed to approve request:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to approve request. Please try again.',
      });
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    if (!confirm('Are you sure you want to cancel this membership request?')) {
      return;
    }

    try {
      await customerService.cancelMembershipRequest(requestId);
      loadRequests(); // Refresh requests list
      addNotification({
        type: 'success',
        title: 'Request Canceled',
        message: 'Membership request has been successfully canceled.',
      });
    } catch (error) {
      console.error('Failed to cancel request:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to cancel request. Please try again.',
      });
    }
  };

  useEffect(() => {
    loadRequests();
  }, [businessId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Pending Membership Requests
          </h2>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 text-center text-gray-500 dark:text-gray-400">
            No pending membership requests
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Pending Membership Requests
        </h2>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Phone
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {request.customer.first_name} {request.customer.last_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{request.customer.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{request.customer.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleApproveRequest(request.id)}
                    className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300 mr-2"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleCancelRequest(request.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
