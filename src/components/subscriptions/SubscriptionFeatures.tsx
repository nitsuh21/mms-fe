import React from 'react';
import { Subscription } from '@/types/subscription';

interface SubscriptionFeaturesProps {
  subscription: Subscription;
}

const SubscriptionFeatures: React.FC<SubscriptionFeaturesProps> = ({ subscription }) => {
  const isTrial = subscription.status === 'TR';
  const isActive = subscription.status === 'AC';
  const isOverdue = subscription.status === 'PD';
  const isCancelled = subscription.status === 'CN';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Subscription Features</h3>
      
      <div className="space-y-4">
        {/* Trial Status */}
        {isTrial && subscription.trial_end && (
          <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">T</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Trial Active
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Trial ends: {new Date(subscription.trial_end).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Billing Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Next Billing Date
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(subscription.next_billing_date).toLocaleDateString()}
            </p>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Billing Cycle
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subscription.billing_cycle}
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap gap-2">
          {isActive && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              Active
            </span>
          )}
          
          {isTrial && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              Trial
            </span>
          )}
          
          {isOverdue && (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
              Overdue
            </span>
          )}
          
          {isCancelled && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
              Cancelled
            </span>
          )}
        </div>

        {/* Cancellation Info */}
        {isCancelled && subscription.cancelled_at && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm font-medium text-red-900 dark:text-red-100">
              Cancelled on {new Date(subscription.cancelled_at).toLocaleDateString()}
            </p>
            {subscription.cancellation_reason && (
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Reason: {subscription.cancellation_reason}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionFeatures; 