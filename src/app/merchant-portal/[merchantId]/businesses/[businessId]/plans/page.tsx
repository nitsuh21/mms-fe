"use client";

import { useState, useEffect } from 'react';
import { Form, InputField, SelectField, SubmitButton } from '@/components/ui/Form';
import { useNotification } from '@/context/NotificationContext';
import { FiPlus, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';
import { subscriptionPlansService } from '@/services/subscriptionPlans';
import { SubscriptionPlan } from '@/services/subscriptionPlans';

export default function PlansPage({ params }: { params: { businessId: string } }) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const { addNotification } = useNotification();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | undefined>(undefined);

  useEffect(() => {
    loadPlans();

  }, []);

  const loadPlans = async () => {
    try {
      const response = await subscriptionPlansService.getAll();
      const formattedPlans = (response as any).results.map((plan: SubscriptionPlan) => ({
        ...plan,
        billingPeriod: plan.interval === 'M' ? 'monthly' : 
                       plan.interval === 'Y' ? 'annual' : 'quarterly',
        features: Object.entries(plan.features)
          .filter(([_, value]) => value)
          .map(([key]) => key),
        activeSubscribers: 0, // This would come from the API
        status: plan.is_active ? 'active' : 'archived'
      }));
      setPlans(formattedPlans);
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load subscription plans',
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlan = async (data: any) => {
    try {
      // Convert features from string to Record<string, boolean>
      const features = data.features.split('\n').reduce((acc: Record<string, boolean>, feature: string) => {
        if (feature.trim()) {
          acc[feature.trim()] = true;
        }
        return acc;
      }, {});

      await subscriptionPlansService.create({
        ...data,
        features,
        is_active: data.is_active === 'true' || data.is_active === true,
        interval: data.interval as 'D' | 'W' | 'M' | 'Y'
      });

      addNotification({
        type: 'success',
        title: 'Plan Added',
        message: 'New subscription plan has been successfully created.',
      });
      setShowAddPlan(false);
      loadPlans();
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create subscription plan',
      });
      console.error(err);
    }
  };

  const handleEditPlan = async (plan: SubscriptionPlan, data: any) => {
    try {
      // Convert features from string to Record<string, boolean>
      const features = data.features.split('\n').reduce((acc: Record<string, boolean>, feature: string) => {
        if (feature.trim()) {
          acc[feature.trim()] = true;
        }
        return acc;
      }, {});

      await subscriptionPlansService.update(plan.id, {
        ...data,
        features,
        business: params.businessId,
        is_active: data.is_active === 'true' || data.is_active === true,
        interval: data.interval as 'D' | 'W' | 'M' | 'Y'
      });

      addNotification({
        type: 'success',
        title: 'Plan Updated',
        message: 'Subscription plan has been successfully updated.',
      });
      loadPlans();
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update subscription plan',
      });
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subscription plan?')) return;

    try {
      await subscriptionPlansService.delete(id);
      setPlans(plans.filter(plan => plan.id !== id));
      addNotification({
        type: 'success',
        title: 'Plan Deleted',
        message: 'Subscription plan has been successfully deleted.',
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete subscription plan',
      });
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Subscription Plans
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create and manage your subscription plans
          </p>
        </div>

        <button
          onClick={() => setShowAddPlan(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          <FiPlus className="h-4 w-4" />
          Add Plan
        </button>
      </div>

      {/* Add Plan Form */}
      {showAddPlan && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {selectedPlan ? 'Edit Plan' : 'Add New Plan'}
          </h2>
          <Form onSubmit={selectedPlan ? (data) => handleEditPlan(selectedPlan, data) : handleAddPlan} className="space-y-4">
            {(methods) => (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g., Premium Plan"
                      defaultValue={selectedPlan?.name}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                      {...methods.register('name', { required: 'Plan name is required' })}
                    />
                    {methods.formState.errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {methods.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      placeholder="Enter plan description"
                      defaultValue={selectedPlan?.description}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                      {...methods.register('description', { required: 'Description is required' })}
                    />
                    {methods.formState.errors.description && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {methods.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="price"
                        placeholder="Enter price"
                        defaultValue={selectedPlan?.price}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                        {...methods.register('price', { required: 'Price is required' })}
                      />
                      <select
                        name="currency"
                        defaultValue={selectedPlan?.currency || 'USD'}
                        className="absolute right-2 top-2 bg-transparent text-sm text-gray-700 dark:text-gray-300"
                      >
                        <option value="USD">USD</option>
                        <option value="ETB">ETB</option>
                      </select>
                    </div>
                    {methods.formState.errors.price && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {methods.formState.errors.price.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Billing Period
                    </label>
                    <select
                      name="interval"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                      {...methods.register('interval', { required: 'Billing period is required' })}
                      defaultValue={selectedPlan?.interval}
                    >
                      <option value="M">Monthly</option>
                      <option value="Q">Quarterly</option>
                      <option value="Y">Annual</option>
                    </select>
                    {methods.formState.errors.interval && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {methods.formState.errors.interval.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Trial Period (days)
                    </label>
                    <input
                      type="number"
                      name="trial_days"
                      placeholder="Enter trial period in days"
                      defaultValue={selectedPlan?.trial_days}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                      {...methods.register('trial_days')}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Features (one per line)
                    </label>
                    <textarea
                      name="features"
                      placeholder="Enter features, one per line"
                      defaultValue={selectedPlan?.features ? selectedPlan.features.join('\n') : ''}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                      {...methods.register('features', { required: 'At least one feature is required' })}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Enter each feature on a new line
                    </p>
                    {methods.formState.errors.features && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {methods.formState.errors.features.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      name="is_active"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                      {...methods.register('is_active', { required: 'Status is required' })}
                      defaultValue={selectedPlan?.is_active ? 'true' : 'false'}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                    {methods.formState.errors.is_active && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {methods.formState.errors.is_active.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddPlan(false);
                      setSelectedPlan(undefined);
                    }}
                    className="w-full sm:w-auto rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
                    disabled={methods.formState.isSubmitting}
                  >
                    {methods.formState.isSubmitting ? 'Saving...' : selectedPlan ? 'Update Plan' : 'Add Plan'}
                  </button>
                </div>
              </>
            )}
          </Form>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Loading plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-2 text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No subscription plans found</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className="relative rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Plan Header */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowAddPlan(true);
                    }}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Plan Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Price:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ${plan.price} / {plan.billingPeriod}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      plan.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Features:
                  </span>
                  <ul className="space-y-1">
                    {plan.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <FiCheck className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
