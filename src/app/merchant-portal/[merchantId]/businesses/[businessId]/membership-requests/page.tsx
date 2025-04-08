'use client';

import { useState, useEffect } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { MembershipRequest, MembershipRequestStatus } from '@/types/membershipRequest';
import { MembershipRequestService } from '@/services/membershipRequestService';
import Button from '@/components/ui/button/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/modal';
import { useForm } from 'react-hook-form';

const membershipRequestService = new MembershipRequestService();

interface DataTableCellInfo {
  row: {
    original: MembershipRequest;
  };
}

const MembershipRequestsPage = ({ merchantId, businessId }: { merchantId: string; businessId: string }) => {
  const { addNotification } = useNotification();
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const methods = useForm({
    defaultValues: {
      role: 'staff',
      message: ''
    }
  });
  const { register, handleSubmit } = methods;

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await membershipRequestService.getReceivedRequests(parseInt(businessId));
      setRequests(response);
    } catch (error) {
      console.error('Error fetching membership requests:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load membership requests'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [businessId]);

  const handleCreateRequest = async (data: any) => {
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
      await membershipRequestService.updateRequest(requestId, status);
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
      await membershipRequestService.deleteRequest(requestId);
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

  const columns = [
    {
      key: 'requestor',
      title: 'Requestor',
      render: (request: MembershipRequest) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{request.requestor.first_name} {request.requestor.last_name}</span>
          <span className="text-sm text-gray-500">{request.requestor.email}</span>
        </div>
      ),
    },
    {
      key: 'business',
      title: 'Business',
      render: (request: MembershipRequest) => request.business.name,
    },
    {
      key: 'role',
      title: 'Role',
      render: (request: MembershipRequest) => request.role,
    },
    {
      key: 'status',
      title: 'Status',
      render: (request: MembershipRequest) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          request.status === 'approved' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {request.status}
        </span>
      ),
    },
    {
      key: 'message',
      title: 'Message',
      render: (request: MembershipRequest) => request.message,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (request: MembershipRequest) => (
        <div className="flex items-center gap-2">
          {request.status === 'pending' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleUpdateRequest(request.id, 'approved')}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateRequest(request.id, 'rejected')}
              >
                Reject
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteRequest(request.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Membership Requests</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <DataTable
          data={requests}
          columns={columns}
          loading={loading}
          emptyState="No membership requests found"
        />
      </div>

      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Request Membership</h2>
          <form onSubmit={handleSubmit(handleCreateRequest)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  {...register('role')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="owner">Owner</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  {...register('message')}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRequestModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
              >
                Send Request
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default MembershipRequestsPage;
