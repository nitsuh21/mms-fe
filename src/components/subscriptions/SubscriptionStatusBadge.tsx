import React from 'react';
import { Subscription, SubscriptionStatus } from '@/types/subscription';

interface SubscriptionStatusBadgeProps {
  subscription: Subscription;
  statusInfo?: SubscriptionStatus;
  showDetails?: boolean;
}

const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({
  subscription,
  statusInfo,
  showDetails = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AC':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'TR':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PD':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'EX':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'PN':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AC':
        return 'Active';
      case 'TR':
        return 'Trial';
      case 'PD':
        return 'Pending';
      case 'CN':
        return 'Cancelled';
      case 'EX':
        return 'Expired';
      case 'PN':
        return 'Pending';
      default:
        return status;
    }
  };

  const isTrialActive = statusInfo?.is_trial_active || false;
  const isOverdue = statusInfo?.is_overdue || false;
  const isExpired = statusInfo?.is_expired || false;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(subscription.status)}`}>
          {getStatusText(subscription.status)}
        </span>
        
        {isTrialActive && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            Trial Active
          </span>
        )}
        
        {isOverdue && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
            Overdue
          </span>
        )}
        
        {isExpired && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
            Expired
          </span>
        )}
      </div>

      {showDetails && (
        <div className="text-xs text-gray-600 space-y-1">
          {subscription.trial_end && (
            <div>
              <span className="font-medium">Trial ends:</span> {new Date(subscription.trial_end).toLocaleDateString()}
            </div>
          )}
          <div>
            <span className="font-medium">Next billing:</span> {new Date(subscription.next_billing_date).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Billing cycle:</span> {subscription.billing_cycle}
          </div>
          {subscription.cancelled_at && (
            <div>
              <span className="font-medium">Cancelled:</span> {new Date(subscription.cancelled_at).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatusBadge; 