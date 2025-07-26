'use client';

import React, { useState, useEffect } from 'react';
import { Subscription, subscriptionService } from '@/services/subscriptionService';
import { SubscriptionStatus } from '@/types/subscription';
import { useNotification } from '@/context/NotificationContext';
import { formatDate } from '@/utils/dateUtils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { FiCalendar, FiClock, FiDollarSign, FiUser, FiAlertTriangle } from 'react-icons/fi';
import SubscriptionStatusBadge from './SubscriptionStatusBadge';
import SubscriptionActions from './SubscriptionActions';

interface SubscriptionDetailsProps {
  subscription: Subscription;
  onUpdate: () => void;
}

export const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({
  subscription,
  onUpdate,
}) => {
  const { showNotification } = useNotification();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'AC':
        return 'bg-green-100 text-green-800';
          case 'PN':
      return 'bg-blue-100 text-blue-800';
      case 'PD':
        return 'bg-yellow-100 text-red-800';
      case 'CN':
        return 'bg-red-100 text-red-800';
      case 'TR':
        return 'bg-blue-100 text-blue-800';
      case 'EX':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
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

  const handleCancel = async () => {
    try {
      setLoading(true);
      await subscriptionService.cancelSubscription(Number(subscription.id));
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Subscription cancelled successfully',
      });
      onUpdate();
    } catch (error: any) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to cancel subscription',
      });
    } finally {
      setLoading(false);
      setShowCancelDialog(false);
    }
  };

  const handleConvertTrial = async () => {
    try {
      setLoading(true);
      await subscriptionService.convertTrial(Number(subscription.id));
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Trial converted to active subscription',
      });
      onUpdate();
    } catch (error: any) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to convert trial',
      });
    } finally {
      setLoading(false);
      setShowConvertDialog(false);
    }
  };

  const handleRenew = async () => {
    try {
      setLoading(true);
      await subscriptionService.renewSubscription(Number(subscription.id));
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Subscription renewed successfully',
      });
      onUpdate();
    } catch (error: any) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to renew subscription',
      });
    } finally {
      setLoading(false);
      setShowRenewDialog(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {subscription.plan.name}
          </h3>
          <Badge className={getStatusBadgeColor(subscription.status)}>
            {getStatusLabel(subscription.status)}
          </Badge>
        </div>
        <div className="space-x-2">
          {subscription.status === 'TR' && (
            <Button
              variant="primary"
              onClick={() => setShowConvertDialog(true)}
              disabled={loading}
            >
              Convert to Active
            </Button>
          )}
          {subscription.status === 'EX' && (
            <Button
              variant="primary"
              onClick={() => setShowRenewDialog(true)}
              disabled={loading}
            >
              Renew Subscription
            </Button>
          )}
          {['AC', 'TR'].includes(subscription.status) && (
            <Button
              variant="danger"
              onClick={() => setShowCancelDialog(true)}
              disabled={loading}
            >
              Cancel Subscription
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-2">
          <FiUser className="text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="text-gray-900 dark:text-white">
              {subscription.customer.first_name} {subscription.customer.last_name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <FiDollarSign className="text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="text-gray-900 dark:text-white">
              {subscription.plan.price} {subscription.plan.currency}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <FiCalendar className="text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Start Date</p>
            <p className="text-gray-900 dark:text-white">
              {formatDate(subscription.start_date)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <FiClock className="text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Next Billing</p>
            <p className="text-gray-900 dark:text-white">
              {formatDate(subscription.next_billing_date)}
            </p>
          </div>
        </div>

        {subscription.trial_end && (
          <div className="flex items-center space-x-2">
            <FiClock className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Trial Ends</p>
              <p className="text-gray-900 dark:text-white">
                {formatDate(subscription.trial_end)}
              </p>
            </div>
          </div>
        )}

        {subscription.end_date && (
          <div className="flex items-center space-x-2">
            <FiClock className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="text-gray-900 dark:text-white">
                {formatDate(subscription.end_date)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Dialog */}
      <Dialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <p className="text-gray-500">
              Are you sure you want to cancel this subscription? This action cannot be
              undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowCancelDialog(false)}
              disabled={loading}
            >
              No, Keep It
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              disabled={loading}
            >
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert Trial Dialog */}
      <Dialog
        open={showConvertDialog}
        onOpenChange={setShowConvertDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Trial to Active</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <p className="text-gray-500">
              Are you sure you want to convert this trial to an active subscription?
              You will be billed for the full subscription amount.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowConvertDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConvertTrial}
              disabled={loading}
            >
              Convert to Active
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renew Dialog */}
      <Dialog
        open={showRenewDialog}
        onOpenChange={setShowRenewDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Subscription</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <p className="text-gray-500">
              Are you sure you want to renew this subscription? You will be billed
              for the subscription amount.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowRenewDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRenew}
              disabled={loading}
            >
              Renew Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionDetails;
