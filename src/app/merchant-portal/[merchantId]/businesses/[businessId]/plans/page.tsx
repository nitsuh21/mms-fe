"use client";

import { useState, useEffect, use } from 'react';
import { useForm } from 'react-hook-form';
import { useNotification } from '@/context/NotificationContext';
import { FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { PlanService, Plan, CreatePlanData, UpdatePlanData, Discount } from '@/services/planService';
import { discountsService } from '@/services/discounts';
import api from '@/services/api';
import type { Metadata } from 'next';

const calculateDiscountedPrice = (originalPrice: number, discounts?: Discount[]): number => {
  if (!discounts?.length) return originalPrice;
  
  // Find the first active discount
  const activeDiscount = discounts.find(d => d.is_active);
  if (!activeDiscount) return originalPrice;

  // Calculate the discounted price based on discount type
  if (activeDiscount.discount_type === 'P') {
    return originalPrice * (1 - Number(activeDiscount.discount_value) / 100);
  } else {
    return originalPrice - Number(activeDiscount.discount_value);
  }
};

export default function PlansPage({ params }: { params: { businessId: string } }) {
  const unwrappedParams = use(params as unknown as Promise<{ businessId: string }>);
  const businessId = unwrappedParams.businessId;
  const [plans, setPlans] = useState<Plan[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const { addNotification } = useNotification();
  const methods = useForm<CreatePlanData | UpdatePlanData>({
    defaultValues: {
      name: '',
      description: '',
      business: '',
      price: 0,
      currency: 'ETB',
      interval: 'M',
      trial_days: 0,
      features: {},
      is_active: true,
    },
    resolver: (data) => {
      // Convert features from textarea to Postman format
      const features = data.features || {};
      const featureArray = (typeof features === 'string') ? features.split('\n').filter(f => f.trim()) : [];
      const featureObject = featureArray.reduce((acc, feature) => {
        const key = feature.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
        return { ...acc, [key]: true };
      }, {});

      return {
        values: {
          ...data,
          features: featureObject,
          price: Number(data.price),
          trial_days: Number(data.trial_days),
          is_active: typeof data.is_active === 'string' ? data.is_active === 'true' : data.is_active
        },
        errors: {}
      };
    }
  });

  // Update form reset to handle features properly when editing
  useEffect(() => {
    if (selectedPlan) {
      // Convert Postman format back to textarea format
      const featuresText = Object.entries(selectedPlan.features)
        .filter(([_, value]) => value)
        .map(([key]) => key.replace(/_/g, ' '))
        .join('\n');

      methods.reset({
        ...selectedPlan,
        features: featuresText,
        is_active: selectedPlan.is_active
      });
    }
  }, [selectedPlan, methods]);

  useEffect(() => {
    loadPlans();
    loadDiscounts();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const plans = await PlanService.getPlans(businessId);
      setPlans(plans);
    } catch (err) {
      console.error('Error loading plans:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load subscription plans',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDiscounts = async () => {
    try {
      const response = await discountsService.getAll();
      setDiscounts(response);
    } catch (error) {
      console.error('Error loading discounts:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load discounts',
      });
    }
  };

  const handleAddPlan = async (data: CreatePlanData) => {
    try {
      const newPlan = await PlanService.createPlan(data);
      setPlans(prevPlans => [...prevPlans, newPlan]);
      addNotification({
        type: 'success',
        title: 'Plan Added',
        message: 'New subscription plan has been successfully created.',
      });
      setShowAddPlan(false);
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create subscription plan',
      });
      console.error(err);
    }
  };

  const handleUpdatePlan = async (planId: number, data: UpdatePlanData) => {
    try {
      const updatedPlan = await PlanService.updatePlan(planId, data);
      setPlans(prevPlans => prevPlans.map(plan => 
        plan.id === planId ? updatedPlan : plan
      ));
      addNotification({
        type: 'success',
        title: 'Plan Updated',
        message: 'Subscription plan has been successfully updated.',
      });
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
      await PlanService.deletePlan(id);
      setPlans(prevPlans => prevPlans.filter(plan => plan.id !== id));
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

  const handleConnectDiscount = async (planId: number, discountId: string) => {
    try {
      const response = await api.post(`/subscriptions/plans/${planId}/discounts/${discountId}/apply/`);
      const updatedPlans = await PlanService.getPlans(businessId);
      setPlans(updatedPlans);
      addNotification({
        type: 'success',
        title: 'Discount Connected',
        message: 'Discount has been successfully connected to the plan.',
      });
      setShowDiscountModal(false);
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to connect discount to plan',
      });
      console.error(err);
    }
  };

  const handleDisconnectDiscount = async (planId: number, discountId: string) => {
    try {
      const response = await api.post(`/subscriptions/plans/${planId}/discounts/${discountId}/remove/`);
      const updatedPlans = await PlanService.getPlans(businessId);
      setPlans(updatedPlans);
      addNotification({
        type: 'success',
        title: 'Discount Removed',
        message: 'Discount has been successfully removed from the plan.',
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove discount from plan',
      });
      console.error(err);
    }
  };

  const onSubmit = async (data: CreatePlanData | UpdatePlanData) => {
    const planData = {
      business: businessId,
      name: data.name || '',
      description: data.description || '',
      interval: data.interval || 'M',
      price: Number(data.price) || 0,
      currency: 'ETB',
      trial_days: Number(data.trial_days) || 0,
      features: data.features || {},
      is_active: data.is_active !== false
    };

    if (selectedPlan) {
      await handleUpdatePlan(selectedPlan.id, planData);
    } else {
      await handleAddPlan(planData);
    }
    methods.reset();
    setSelectedPlan(null);
  };

  if (showAddPlan) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {selectedPlan ? 'Edit Subscription Plan' : 'Add New Subscription Plan'}
            </h2>
          </div>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plan Name
                </label>
                <input
                  {...methods.register('name')}
                  type="text"
                  id="name"
                  className="w-full rounded-lg border bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Basic Plan"
                />
                {methods.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                    {methods.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  {...methods.register('description')}
                  id="description"
                  rows={3}
                  className="w-full rounded-lg border bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Enter plan description"
                />
                {methods.formState.errors.description && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                    {methods.formState.errors.description.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">ETB</span>
                  <input
                    {...methods.register('price')}
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    className="w-full rounded-lg border bg-white pl-10 pr-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="0.00"
                  />
                </div>
                {methods.formState.errors.price && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                    {methods.formState.errors.price.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="interval" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Billing Interval
                </label>
                <select
                  {...methods.register('interval')}
                  id="interval"
                  className="w-full rounded-lg border bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="M">Monthly</option>
                  <option value="Y">Annual</option>
                </select>
                {methods.formState.errors.interval && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                    {methods.formState.errors.interval.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="trial_days" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trial Period (days)
                </label>
                <input
                  {...methods.register('trial_days')}
                  type="number"
                  id="trial_days"
                  min="0"
                  className="w-full rounded-lg border bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="0"
                />
                {methods.formState.errors.trial_days && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                    {methods.formState.errors.trial_days.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  {...methods.register('is_active')}
                  id="is_active"
                  className="w-full rounded-lg border bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                {methods.formState.errors.is_active && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                    {methods.formState.errors.is_active.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="features" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Features (one per line)
              </label>
              <textarea
                {...methods.register('features')}
                id="features"
                rows={4}
                className="w-full rounded-lg border bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Feature 1\nFeature 2\nFeature 3"
              />
              {methods.formState.errors.features && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {methods.formState.errors.features.message}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  methods.reset();
                  setSelectedPlan(null);
                  setShowAddPlan(false);
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                {selectedPlan ? 'Update Plan' : 'Add Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (showDiscountModal && selectedPlan) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {selectedDiscount ? 'Edit Discount Connection' : 'Add Discount'}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {selectedDiscount ? (
              <div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedDiscount.discount_type === 'P' 
                        ? `${selectedDiscount.discount_value}%` 
                        : `ETB ${selectedDiscount.discount_value}`}
                    </span>
                    <span className="text-lg font-semibold text-gray-900 pl-2 dark:text-white">{selectedDiscount.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Valid From:</span>
                    <span className="px-2 py-1 text-sm rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      {new Date(selectedDiscount.valid_from).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Valid Until:</span>
                    <span className="px-2 py-1 text-sm rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      {new Date(selectedDiscount.valid_until).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                  Select a discount to connect with this plan:
                </p>
                <div className="grid gap-4">
                  {discounts?.map((discount: Discount) => (
                    <div
                      key={discount.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center">
                              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {discount.discount_type === 'P' 
                                  ? `${discount.discount_value}%` 
                                  : `ETB ${discount.discount_value}`}
                              </span>
                              <span className="text-lg font-semibold text-gray-900 pl-2 dark:text-white">{discount.name}</span>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(discount.valid_from).toLocaleDateString()} - 
                              {new Date(discount.valid_until).toLocaleDateString()}
                            </span>
                          </div>
                          <button
                            onClick={() => handleConnectDiscount(selectedPlan.id, discount.id)}
                            className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700"
                          >
                            Connect
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</span>
                          <span className="px-2 py-1 text-sm rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                            {discount.discount_type === 'P' ? 'Percentage' : 'Fixed Amount'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                          <span className="px-2 py-1 text-sm rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                            {discount.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <button
          onClick={() => {
            setShowAddPlan(true);
            setSelectedPlan(null);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Loading plans...</p>
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
                  <div className="flex items-center gap-2">
                    {plan.discounts?.some(d => d.is_active) ? (
                      <>
                        <span className="line-through text-sm text-gray-500 dark:text-gray-400">
                          ${plan.price} / {plan.interval === 'M' ? 'monthly' : 'annual'}
                        </span>
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                          ${calculateDiscountedPrice(plan.price, plan.discounts)} / {plan.interval === 'M' ? 'monthly' : 'annual'}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ${plan.price} / {plan.interval === 'M' ? 'monthly' : 'annual'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      plan.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Features:
                  </span>
                  <ul className="space-y-1">
                    {Object.entries(plan.features)
                      .filter(([_, value]) => value)
                      .map(([feature], index) => (
                        <li key={index} className="flex items-center gap-2">
                          <FiCheck className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                        </li>
                      ))}
                  </ul>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Discounts:
                  </span>
                  <div className="space-y-2">
                    {plan.discounts?.length ? (
                      plan.discounts.map((discount) => (
                        <div key={discount.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {discount.discount_type === 'P' 
                                ? `${discount.discount_value}%` 
                                : `ETB ${discount.discount_value}`}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {discount.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(discount.valid_from).toLocaleDateString()} - 
                              {new Date(discount.valid_until).toLocaleDateString()}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to remove this discount?')) {
                                handleDisconnectDiscount(plan.id, discount.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No discounts connected</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Connect Discount Button */}
              <div className="mt-4">
                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setShowDiscountModal(true);
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Connect Discount
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
