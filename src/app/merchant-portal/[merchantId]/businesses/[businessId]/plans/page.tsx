"use client";

import { useState } from 'react';
import { Form, InputField, SelectField, SubmitButton } from '@/components/ui/Form';
import { useNotification } from '@/context/NotificationContext';
import { FiPlus, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'quarterly' | 'annual';
  features: string[];
  activeSubscribers: number;
  status: 'active' | 'draft' | 'archived';
}

// Mock data - replace with API call
const mockPlans: SubscriptionPlan[] = [
  {
    id: '1',
    name: 'Basic Plan',
    description: 'Perfect for individuals',
    price: 29.99,
    billingPeriod: 'monthly',
    features: [
      'Access to basic facilities',
      'Standard support',
      'Basic analytics',
      'Up to 2 devices',
    ],
    activeSubscribers: 145,
    status: 'active',
  },
  {
    id: '2',
    name: 'Premium Plan',
    description: 'Best for professionals',
    price: 89.99,
    billingPeriod: 'monthly',
    features: [
      'Access to all facilities',
      'Priority support',
      'Advanced analytics',
      'Unlimited devices',
      'Guest passes',
    ],
    activeSubscribers: 89,
    status: 'active',
  },
];

interface AddPlanFormData {
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'quarterly' | 'annual';
  features: string;
}

export default function PlansPage({ params }: { params: { businessId: string } }) {
  const [showAddPlan, setShowAddPlan] = useState(false);
  const { addNotification } = useNotification();

  const handleAddPlan = (data: AddPlanFormData) => {
    // Replace with API call
    console.log('Adding plan:', data);
    addNotification({
      type: 'success',
      title: 'Plan Added',
      message: 'New subscription plan has been successfully created.',
    });
    setShowAddPlan(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Subscription Plans
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
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
            Add New Plan
          </h2>
          <Form<AddPlanFormData> onSubmit={handleAddPlan} className="space-y-4">
            {(methods) => (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    name="name"
                    label="Plan Name"
                    placeholder="e.g., Premium Plan"
                    rules={{ required: 'Plan name is required' }}
                    methods={methods}
                  />
                  <InputField
                    name="price"
                    label="Price"
                    type="number"
                    placeholder="Enter price"
                    rules={{ required: 'Price is required' }}
                    methods={methods}
                  />
                  <SelectField
                    name="billingPeriod"
                    label="Billing Period"
                    options={[
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'quarterly', label: 'Quarterly' },
                      { value: 'annual', label: 'Annual' },
                    ]}
                    rules={{ required: 'Billing period is required' }}
                    methods={methods}
                  />
                  <div className="col-span-2">
                    <InputField
                      name="description"
                      label="Description"
                      placeholder="Enter plan description"
                      rules={{ required: 'Description is required' }}
                      methods={methods}
                    />
                  </div>
                  <div className="col-span-2">
                    <InputField
                      name="features"
                      label="Features (one per line)"
                      placeholder="Enter features, one per line"
                      rules={{ required: 'At least one feature is required' }}
                      methods={methods}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Enter each feature on a new line
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddPlan(false)}
                    className="w-full sm:w-auto rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <SubmitButton className="w-full sm:w-auto">Add Plan</SubmitButton>
                </div>
              </>
            )}
          </Form>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockPlans.map((plan) => (
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
                    console.log('Edit plan:', plan);
                  }}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    console.log('Delete plan:', plan);
                  }}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Plan Price */}
            <div className="mb-4">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                ${plan.price}
                <span className="text-base font-normal text-gray-600 dark:text-gray-400">
                  /{plan.billingPeriod.slice(0, 2)}
                </span>
              </p>
            </div>

            {/* Plan Features */}
            <ul className="mb-6 space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <FiCheck className="mt-1 h-4 w-4 flex-shrink-0 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Plan Stats */}
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Subscribers</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {plan.activeSubscribers}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  plan.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : plan.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                }`}
              >
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
