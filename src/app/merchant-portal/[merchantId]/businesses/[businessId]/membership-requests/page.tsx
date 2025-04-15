'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import { MembershipRequest } from '@/types/membership';
import { customerService } from '@/services/customerService';

export default function MembershipRequestsPage() {
  const params = useParams();
  const businessId = params?.businessId as string;
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotification();

  const loadRequests = async () => {
    if (!businessId) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Business ID is missing.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await customerService.getMembershipRequests(businessId);
      setRequests(response || []);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Failed to load requests:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to load membership requests. Please try again.',
      });
      setRequests([]);
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    try {
      await customerService.approveMembershipRequest(businessId, requestId);
      const response = await customerService.getMembershipRequests(businessId);
      setRequests(response);
      addNotification({
        type: 'success',
        title: 'Request Approved',
        message: 'Membership request has been approved.',
      });
    } catch (error: any) {
      console.error('Failed to approve request:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to approve request. Please try again.',
      });
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      if (!businessId) {
        throw new Error('Business ID is missing');
      }
      await customerService.rejectMembershipRequest(businessId, requestId);
      const response = await customerService.getMembershipRequests(businessId);
      setRequests(response);
      addNotification({
        type: 'success',
        title: 'Request Rejected',
        message: 'Membership request has been rejected.',
      });
    } catch (error: any) {
      console.error('Failed to reject request:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to reject request. Please try again.',
      });
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      await customerService.cancelMembershipRequest(requestId);
      const response = await customerService.getMembershipRequests(businessId);
      setRequests(response);
      addNotification({
        type: 'success',
        title: 'Request Cancelled',
        message: 'Membership request has been cancelled.',
      });
    } catch (error: any) {
      console.error('Failed to cancel request:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to cancel request. Please try again.',
      });
    }
  };



  useEffect(() => {
    if (businessId) {
      const fetchRequests = async () => {
        if (!businessId) {
          addNotification({
            type: 'error',
            title: 'Error',
            message: 'Business ID is missing.',
          });
          setIsLoading(false);
          return;
        }

        try {
          const response = await customerService.getMembershipRequests(businessId);
          setRequests(response || []);
          setIsLoading(false);
        } catch (error: any) {
          console.error('Error fetching membership requests:', error);
          addNotification({
            type: 'error',
            title: 'Error',
            message: error.message || 'Failed to load membership requests. Please try again.',
          });
          setRequests([]);
          setIsLoading(false);
        }
      };
      fetchRequests();
    }
  }, [businessId]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredRequests = requests.filter((request) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      request.customer_email?.toLowerCase().includes(searchLower) ||
      request.business_name?.toLowerCase().includes(searchLower) ||
      request.user_email?.toLowerCase().includes(searchLower) ||
      request.type.toLowerCase().includes(searchLower) ||
      request.status.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Membership Requests
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search requests..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Customer Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Business Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      User Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Created at
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredRequests.length > 0 ? (
                    requests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {request.customer_email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {request.business_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-full ${
                            request.user
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>{request.user ? 'Synced' : 'Not Synced'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {request.type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            request.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              : request.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {new Date(request.created_at).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {request.status === 'PENDING' && request.type === 'SYNC' && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-2"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mr-2"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleCancelRequest(request.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {request.status === 'PENDING' && request.type === 'MEMBER' && (
                            <>
                              <button
                                onClick={() => handleCancelRequest(request.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        {isLoading ? 'Loading...' : 'No membership requests found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}