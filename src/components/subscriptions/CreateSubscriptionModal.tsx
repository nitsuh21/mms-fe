'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useNotification } from '@/context/NotificationContext';
import { subscriptionService } from '@/services/subscriptionService';
import { Customer, customerService } from '@/services/customerService';
import { Plan, PlanService } from '@/services/planService';
import { FiCalendar } from 'react-icons/fi';

interface CreateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateSubscriptionModal: React.FC<CreateSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { businessId } = useParams();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [formData, setFormData] = useState({
    customer_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    use_trial: false,
  });

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      loadPlans();
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    try {
      const response = await customerService.getCustomers(businessId as string);
      setCustomers(response);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadPlans = async () => {
    try {
      const response = await PlanService.getPlans(businessId as string);
      setPlans(response);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id || !formData.plan_id || !formData.start_date) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    try {
      setLoading(true);
      const plan = plans.find((p) => p.id === parseInt(formData.plan_id));
      if (!plan) throw new Error('Invalid plan selected');

      const data = {
        business: parseInt(businessId as string),
        customer_id: parseInt(formData.customer_id),
        plan_id: parseInt(formData.plan_id),
        start_date: formData.start_date,
        use_trial: formData.use_trial && plan.has_trial,
      };

      await subscriptionService.createSubscription(data);
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Subscription created successfully',
      });
      onSuccess();
    } catch (error: any) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create subscription',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = plans.find(
    (p) => p.id === parseInt(formData.plan_id)
  );

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create New Subscription">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div>
          <label
            htmlFor="customer"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Customer
          </label>
          <Select
            id="customer"
            value={formData.customer_id}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, customer_id: e.target.value }))
            }
            className="mt-1"
            required
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.first_name} {customer.last_name}
              </option>
            ))}
          </Select>
        </div>

        {/* Plan Selection */}
        <div>
          <label
            htmlFor="plan"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Subscription Plan
          </label>
          <Select
            id="plan"
            value={formData.plan_id}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, plan_id: e.target.value }))
            }
            className="mt-1"
            required
          >
            <option value="">Select a plan</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} - {plan.price} {plan.currency}/{plan.interval}
              </option>
            ))}
          </Select>
        </div>

        {/* Start Date */}
        <div>
          <label
            htmlFor="start_date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Start Date
          </label>
          <div className="mt-1 relative">
            <Input
              type="date"
              id="start_date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  start_date: e.target.value,
                }))
              }
              className="pl-10"
              required
            />
            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Trial Option */}
        {selectedPlan?.has_trial && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="use_trial"
              checked={formData.use_trial}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  use_trial: e.target.checked,
                }))
              }
              className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
            />
            <label
              htmlFor="use_trial"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              Start with trial period ({selectedPlan.trial_days} days)
            </label>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Subscription'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default CreateSubscriptionModal;
