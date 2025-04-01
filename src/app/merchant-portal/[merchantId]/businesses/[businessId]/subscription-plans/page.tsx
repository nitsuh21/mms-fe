"use client";

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { subscriptionPlansService } from '@/services/subscriptionPlans';
import { SubscriptionPlan } from '@/services/subscriptionPlans';
import SubscriptionPlanModal from '@/components/subscription-plans/SubscriptionPlanModal';

export default function SubscriptionPlansPage({ params }: { params: { businessId: string } }) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | undefined>(undefined);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await subscriptionPlansService.getAll();
      setPlans(data);
      setError(null);
    } catch (err) {
      setError('Failed to load subscription plans');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setSelectedPlan(undefined);
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subscription plan?')) return;

    try {
      await subscriptionPlansService.delete(id);
      setPlans(plans.filter(plan => plan.id !== id));
    } catch (err) {
      setError('Failed to delete subscription plan');
      console.error(err);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPlan(undefined);
  };

  const handleModalSuccess = () => {
    loadPlans();
    handleModalClose();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Subscription Plans</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage your subscription plans and pricing
          </p>
        </div>

        <button
          onClick={handleCreatePlan}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          <FiPlus className="h-4 w-4" />
          Add Plan
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Name
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Price
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Interval
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Trial Days
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 sm:px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 sm:px-6 py-4 text-center">
                    No subscription plans found
                  </td>
                </tr>
              ) : (
                (plans as any).results.map((plan: SubscriptionPlan) => (
                  <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {plan.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {plan.description}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {plan.price} {plan.currency}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {plan.interval === 'D' && 'Daily'}
                      {plan.interval === 'W' && 'Weekly'}
                      {plan.interval === 'M' && 'Monthly'}
                      {plan.interval === 'Y' && 'Yearly'}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {plan.trial_days} days
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          plan.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditPlan(plan)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SubscriptionPlanModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={selectedPlan}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
