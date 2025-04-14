'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { MembershipRequest, MembershipRequestStatus, MembershipRequestType } from '@/types/membershipRequest';
import { MembershipRequestService } from '@/services/membershipRequestService';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useForm } from 'react-hook-form';

const membershipRequestService = new MembershipRequestService();

type RequestFormData = {
  role: 'owner' | 'manager' | 'staff';
  message: string;
};

export default function MembershipRequestsPage() {
  const params = useParams();
  const businessId = params?.businessId as string;
  const { addNotification } = useNotification();
  const { user } = useAuth();
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const methods = useForm<RequestFormData>({
    defaultValues: {
      role: 'staff',
      message: ''
    }
  });
  const { register, handleSubmit } = methods;

  const fetchRequests = async () => {
    try {
      if (!businessId || isNaN(parseInt(businessId))) {
        throw new Error('Invalid business ID');
      }
      setLoading(true);
      const response = await membershipRequestService.getRequests(parseInt(businessId));
      setRequests(response);
    } catch (error) {
      console.error('Error fetching membership requests:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to load membership requests'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [businessId]);

  const handleCreateRequest = async (data: RequestFormData) => {
    try {
      await membershipRequestService.createRequest(
        parseInt(businessId),
        data.role,
        data.message
      );
      setShowRequestModal(false);
      fetchRequests();
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Membership request sent successfully'
      });
    } catch (error) {
      console.error('Error creating membership request:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to send membership request'
      });
    }
  };

  const handleUpdateRequest = async (requestId: number, status: MembershipRequestStatus) => {
    try {
      await membershipRequestService.updateRequest(parseInt(businessId), requestId, status);
      fetchRequests();
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Request status updated successfully'
      });
    } catch (error) {
      console.error('Error updating request status:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update request status'
      });
    }
  };

  const handleDeleteRequest = async (requestId: number) => {
    if (!confirm('Are you sure you want to delete this request?')) {
      return;
    }

    try {
      await membershipRequestService.deleteRequest(parseInt(businessId), requestId);
      fetchRequests();
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Request deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting request:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete request'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Membership Requests</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage membership requests for your business
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Customer ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Customer Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Requested On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {requests
                .filter(request =>
                  request.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  request.type.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Customer ID: {request.customer}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Type: {request.type}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white capitalize">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${request.user ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                          {request.user ? 'Found' : 'Not Found'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white capitalize">
                        {request.type === 'MEMBER' ? 'Sync Requested' : request.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        request.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {request.type === 'MEMBER' ? 'Membership Request' : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {request.status === 'PENDING' && request.type !== 'MEMBER' && (
                        <>
                          <button
                            onClick={() => handleUpdateRequest(request.id, 'APPROVED')}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateRequest(request.id, 'REJECTED')}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mr-2"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {request.status === 'PENDING' && request.type === 'MEMBER' && (
                        <button
                          onClick={() => handleDeleteRequest(request.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Request Membership</h2>
          <form onSubmit={handleSubmit(handleCreateRequest)} className="space-y-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                id="role"
                {...register('role')}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                id="message"
                {...register('message')}
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Why do you want to join this business?"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowRequestModal(false)}>
                <Button variant="outline">
                  Cancel
                </Button>
              </button>
              <button type="submit">
                <Button variant="primary">
                  Send Request
                </Button>
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}