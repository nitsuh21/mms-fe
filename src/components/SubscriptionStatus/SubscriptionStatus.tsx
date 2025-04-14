import React, { useEffect } from 'react';
import { SubscriptionStatus, NotificationService } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

const SubscriptionStatus: React.FC = () => {
  const { api } = useAuth();
  const notificationService = new NotificationService(api);

  const { data: status, isLoading } = useQuery<SubscriptionStatus>({
    queryKey: ['subscription-status'],
    queryFn: () => notificationService.getSubscriptionStatus(),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-4">Loading...</div>;
  }

  if (status?.status === 'NO_SUBSCRIPTION') {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-2">Subscription Status</h2>
        <p className="text-gray-500">No active subscription</p>
      </div>
    );
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'TR':
        return 'bg-blue-100 text-blue-800';
      case 'AC':
        return 'bg-green-100 text-green-800';
      case 'PD':
        return 'bg-yellow-100 text-yellow-800';
      case 'EX':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2">Subscription Status</h2>
      <div className="flex items-center gap-4">
        <div className={`px-4 py-2 rounded-full ${getStatusClass(status.status)}`}>
          {status.status === 'TR' ? 'Trial' : status.status}
        </div>
        <div className="flex-1">
          <p className="font-medium">{status.plan_name}</p>
          {status.is_trial && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Days remaining:</span>
              <span className="font-medium text-blue-600">
                {status.trial_days_remaining}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
