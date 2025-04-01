"use client";

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { subscriptionPlansService } from '@/services/subscriptionPlans';
import { SubscriptionPlan, CreateSubscriptionPlan } from '@/services/subscriptionPlans';

interface SubscriptionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SubscriptionPlan;
  onSuccess?: () => void;
}

export default function SubscriptionPlanModal({
  isOpen,
  onClose,
  initialData,
  onSuccess
}: SubscriptionPlanModalProps) {
  const [formData, setFormData] = useState<CreateSubscriptionPlan>({
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    interval: 'M',
    trial_days: 0,
    features: {},
    is_active: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        price: initialData.price,
        currency: initialData.currency,
        interval: initialData.interval,
        trial_days: initialData.trial_days,
        features: initialData.features,
        is_active: initialData.is_active
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        currency: 'USD',
        interval: 'M',
        trial_days: 0,
        features: {},
        is_active: true
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (initialData) {
        await subscriptionPlansService.update(initialData.id, formData);
      } else {
        await subscriptionPlansService.create(formData);
      }

      onClose();
      onSuccess?.();
    } catch (err) {
      setError('Failed to save subscription plan');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <FiX className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {initialData ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                  step="0.01"
                  required
                />
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="absolute right-2 top-2 bg-transparent text-sm text-gray-700 dark:text-gray-300"
                >
                  <option value="USD">USD</option>
                  <option value="ETB">ETB</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Billing Interval
              </label>
              <select
                value={formData.interval}
                onChange={(e) => setFormData({ ...formData, interval: e.target.value as any })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="M">Monthly</option>
                <option value="Y">Yearly</option>
                <option value="W">Weekly</option>
                <option value="D">Daily</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trial Period (days)
            </label>
            <input
              type="number"
              value={formData.trial_days}
              onChange={(e) => setFormData({ ...formData, trial_days: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Features
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.features['feature1'] || false}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: {
                      ...formData.features,
                      feature1: e.target.checked
                    }
                  })}
                  className="text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Feature 1</span>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.features['feature2'] || false}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: {
                      ...formData.features,
                      feature2: e.target.checked
                    }
                  })}
                  className="text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Feature 2</span>
              </div>
              {/* Add more features as needed */}
            </div>
          </div>

          <div className="flex items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
              Active
            </label>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="text-brand-600 focus:ring-brand-500 h-4 w-4"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
