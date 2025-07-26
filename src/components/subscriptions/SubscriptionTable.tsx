'use client';

import React, { useState } from 'react';
import { Subscription } from '@/services/subscriptionService';
import { subscriptionService } from '@/services/subscriptionService';
import { useNotification } from '@/context/NotificationContext';
import BulkActions from '@/components/common/BulkActions';
import TableCheckbox from '@/components/common/TableCheckbox';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FiTrash2, FiEdit2, FiEye } from 'react-icons/fi';

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onUpdate: () => void;
  onViewDetails?: (subscription: Subscription) => void;
  onEdit?: (subscription: Subscription) => void;
}

export const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  subscriptions,
  onUpdate,
  onViewDetails,
  onEdit,
}) => {
  const { addNotification } = useNotification();
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'AC':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'PN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'PD':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'CN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'TR':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'EX':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AC':
        return 'Active';
          case 'PN':
      return 'Pending';
      case 'PD':
        return 'Past Due';
      case 'CN':
        return 'Cancelled';
      case 'TR':
        return 'Trial';
      case 'EX':
        return 'Expired';
      default:
        return 'Pending';
    }
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = subscriptions.map(subscription => subscription.id);
      setSelectedSubscriptions(new Set(allIds));
    } else {
      setSelectedSubscriptions(new Set());
    }
  };

  const handleSelectSubscription = (subscriptionId: string, checked: boolean) => {
    const newSelected = new Set(selectedSubscriptions);
    if (checked) {
      newSelected.add(subscriptionId);
    } else {
      newSelected.delete(subscriptionId);
    }
    setSelectedSubscriptions(newSelected);
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      // Cancel all selected subscriptions
      const selectedCount = selectedSubscriptions.size;
      for (const subscriptionId of selectedSubscriptions) {
        await subscriptionService.cancelSubscription(Number(subscriptionId));
      }
      setSelectedSubscriptions(new Set());
      onUpdate();
      addNotification({
        type: 'success',
        title: 'Success',
        message: `${selectedCount} subscriptions cancelled successfully`,
      });
    } catch (error) {
      console.error('Bulk delete failed:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to cancel some subscriptions',
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedSubscriptions(new Set());
  };

  const handleDeleteSingle = async (subscription: Subscription) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }

    try {
      await subscriptionService.cancelSubscription(Number(subscription.id));
      onUpdate();
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Subscription cancelled successfully',
      });
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to cancel subscription',
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Bulk Actions */}
      <BulkActions
        selectedItems={Array.from(selectedSubscriptions)}
        onDeleteSelected={handleBulkDelete}
        onClearSelection={handleClearSelection}
        itemName="subscriptions"
        isLoading={isBulkDeleting}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <TableCheckbox
                  checked={subscriptions.length > 0 && selectedSubscriptions.size === subscriptions.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Next Billing
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {subscriptions.map((subscription) => (
              <tr key={subscription.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <TableCheckbox
                    checked={selectedSubscriptions.has(subscription.id)}
                    onChange={(checked) => handleSelectSubscription(subscription.id, checked)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                        <span className="text-sm font-medium text-brand-600 dark:text-brand-300">
                          {subscription.customer.first_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {subscription.customer.first_name} {subscription.customer.last_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {subscription.customer.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {subscription.plan.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ${subscription.plan.price}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getStatusBadgeColor(subscription.status)}>
                    {getStatusLabel(subscription.status)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {new Date(subscription.start_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {new Date(subscription.end_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {new Date(subscription.next_billing_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                                         {onViewDetails && (
                       <Button
                         variant="outline"
                         onClick={() => onViewDetails(subscription)}
                         className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                       >
                         <FiEye className="h-4 w-4" />
                       </Button>
                     )}
                     {onEdit && (
                       <Button
                         variant="outline"
                         onClick={() => onEdit(subscription)}
                         className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1"
                       >
                         <FiEdit2 className="h-4 w-4" />
                       </Button>
                     )}
                     <Button
                       variant="outline"
                       onClick={() => handleDeleteSingle(subscription)}
                       className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                     >
                       <FiTrash2 className="h-4 w-4" />
                     </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionTable; 