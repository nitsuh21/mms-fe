import React, { useState } from 'react';
import { Subscription } from '@/types/subscription';
import { subscriptionService } from '@/services/subscriptionService';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionActionsProps {
  subscription: Subscription;
  onActionComplete?: () => void;
  availablePlans?: Array<{ id: number; name: string; price: number }>;
}

const SubscriptionActions: React.FC<SubscriptionActionsProps> = ({
  subscription,
  onActionComplete,
  availablePlans = []
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a cancellation reason",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await subscriptionService.cancelSubscription(subscription.id, cancelReason);
      toast({
        title: "Success",
        description: "Subscription cancelled successfully",
      });
      setShowCancelModal(false);
      setCancelReason('');
      onActionComplete?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertTrial = async () => {
    setIsLoading(true);
    try {
      await subscriptionService.convertTrial(subscription.id);
      toast({
        title: "Success",
        description: "Trial converted to paid subscription successfully",
      });
      onActionComplete?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to convert trial",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlanId) {
      toast({
        title: "Error",
        description: "Please select a plan to upgrade to",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await subscriptionService.upgradeSubscription(subscription.id, selectedPlanId);
      toast({
        title: "Success",
        description: "Subscription upgraded successfully",
      });
      setShowUpgradeModal(false);
      setSelectedPlanId(null);
      onActionComplete?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upgrade subscription",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDowngrade = async () => {
    if (!selectedPlanId) {
      toast({
        title: "Error",
        description: "Please select a plan to downgrade to",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await subscriptionService.downgradeSubscription(subscription.id, selectedPlanId);
      toast({
        title: "Success",
        description: "Subscription downgraded successfully",
      });
      setShowUpgradeModal(false);
      setSelectedPlanId(null);
      onActionComplete?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to downgrade subscription",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canCancel = subscription.status === 'AC' || subscription.status === 'TR';
  const canConvertTrial = subscription.status === 'TR';
  const canUpgrade = subscription.status === 'AC' && availablePlans.length > 0;
  const canDowngrade = subscription.status === 'AC' && availablePlans.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {canConvertTrial && (
          <button
            onClick={handleConvertTrial}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Converting...' : 'Convert to Paid'}
          </button>
        )}

        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Cancel Subscription
          </button>
        )}

        {canUpgrade && (
          <button
            onClick={() => setShowUpgradeModal(true)}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Upgrade/Downgrade
          </button>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Cancel Subscription</h3>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              className="w-full p-2 border rounded mb-4 h-24"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade/Downgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Change Plan</h3>
            <select
              value={selectedPlanId || ''}
              onChange={(e) => setSelectedPlanId(Number(e.target.value))}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Select a plan...</option>
              {availablePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.price}
                </option>
              ))}
            </select>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              {selectedPlanId && (
                <>
                  <button
                    onClick={handleDowngrade}
                    disabled={isLoading}
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Downgrade'}
                  </button>
                  <button
                    onClick={handleUpgrade}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Upgrade'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionActions; 