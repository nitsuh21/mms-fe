'use client'

import { useState, useEffect } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { MembershipRequest } from '@/types/membership';
import { customerService, Customer } from '@/services/customerService';
import BulkActions from '@/components/common/BulkActions';
import TableCheckbox from '@/components/common/TableCheckbox';

interface MembershipRequestsProps {
  businessId: string;
}

export default function MembershipRequests({ businessId }: MembershipRequestsProps) {
  const [requests, setRequests] = useState<MembershipRequest[] | null>(null);
  const [customerDetails, setCustomerDetails] = useState<Record<number, Customer>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState<Set<number>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const { addNotification } = useNotification();

  const loadRequests = async () => {
    try {
      const filters = {
        // type: 'SYNC',
        // status: 'PENDING'
      };
      const response = await customerService.getMembershipRequests(businessId, filters);
      console.log("Membership requests response:", response);
      
      // Show all requests (not just pending)
      setRequests(response);
      
      // Fetch customer details for each request
      if (response && response.length > 0) {
        const customerIds = response
          .map(request => request.customer)
          .filter(customerId => typeof customerId === 'number');
        
        const customerDetailsMap: Record<number, Customer> = {};
        
        // Fetch customer details for each unique customer ID
        for (const customerId of customerIds) {
          if (typeof customerId === 'number' && !customerDetailsMap[customerId]) {
            try {
              const customer = await customerService.getCustomer(customerId);
              customerDetailsMap[customerId] = customer;
            } catch (error) {
              console.error(`Failed to fetch customer ${customerId}:`, error);
            }
          }
        }
        
        setCustomerDetails(customerDetailsMap);
      }
      
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
    console.log(`DEBUG: Canceling request ${requestId}`);
    try {
      await customerService.cancelMembershipRequest(requestId);
      console.log(`DEBUG: Request ${requestId} canceled successfully`);
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

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked && requests) {
      // Only select pending requests for bulk operations
      const pendingIds = requests.filter(request => request.status === 'PENDING').map(request => request.id);
      setSelectedRequests(new Set(pendingIds));
    } else {
      setSelectedRequests(new Set());
    }
  };

  const handleSelectRequest = (requestId: number, checked: boolean) => {
    const newSelected = new Set(selectedRequests);
    if (checked) {
      newSelected.add(requestId);
    } else {
      newSelected.delete(requestId);
    }
    setSelectedRequests(newSelected);
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      // Cancel all selected requests
      for (const requestId of selectedRequests) {
        await customerService.cancelMembershipRequest(requestId);
      }
      setSelectedRequests(new Set());
      loadRequests(); // Refresh the list
      addNotification({
        type: 'success',
        title: 'Requests Canceled',
        message: `${selectedRequests.size} membership requests have been successfully canceled.`,
      });
    } catch (error) {
      console.error('Bulk delete failed:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to cancel some requests. Please try again.',
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedRequests(new Set());
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
            Membership Requests
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
      {/* Bulk Actions */}
      <BulkActions
        selectedItems={Array.from(selectedRequests).map(id => id.toString())}
        onDeleteSelected={handleBulkDelete}
        onClearSelection={handleClearSelection}
        itemName="requests"
        isLoading={isBulkDeleting}
      />

      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Membership Requests
        </h2>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                              <TableCheckbox
                                checked={requests && requests.filter(r => r.status === 'PENDING').length > 0 && selectedRequests.size === requests.filter(r => r.status === 'PENDING').length}
                                onChange={handleSelectAll}
                              />
              </th>
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
                  <TableCheckbox
                    checked={selectedRequests.has(request.id)}
                    onChange={(checked) => handleSelectRequest(request.id, checked)}
                    disabled={request.status !== 'PENDING'}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {typeof request.customer === 'number' && customerDetails[request.customer] 
                      ? `${customerDetails[request.customer].first_name || ''} ${customerDetails[request.customer].last_name || ''}`.trim() || 'N/A'
                      : 'Loading...'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {typeof request.customer === 'number' && customerDetails[request.customer]
                      ? customerDetails[request.customer].email
                      : request.customer_email || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {typeof request.customer === 'number' && customerDetails[request.customer]
                      ? customerDetails[request.customer].phone
                      : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    request.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    request.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {request.status === 'PENDING' ? (
                    <>
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
                    </>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                      {request.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
