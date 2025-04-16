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

interface PlanFormData {
  name?: string;
  description?: string;
  price?: number;
  discounted_price?: number;
  currency?: string;
  interval?: 'D' | 'W' | 'M' | 'Y';
  trial_days?: number;
  features?: string;
  is_active?: boolean | string;
}

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<number | null>(null);
  const { addNotification } = useNotification();
  const methods = useForm<PlanFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      discounted_price: 0,
      currency: 'ETB',
      interval: 'M',
      trial_days: 0,
      features: '',
      is_active: true
    },
    resolver: (data) => {
      // Convert features from textarea to string
      const features = data.features || '';

      return {
        values: {
          ...data,
          features: features,
          price: Number(data.price),
          discounted_price: Number(data.discounted_price), 
          trial_days: Number(data.trial_days),
          is_active: typeof data.is_active === 'string' ? data.is_active === 'true' : data.is_active
        },
        errors: {}
      };
    }
  });

  useEffect(() => {
    if (selectedPlan) {
      // Get features as string
      const featuresString = selectedPlan.features || '';

      methods.reset({
        name: selectedPlan.name,
        description: selectedPlan.description,
        price: Number(selectedPlan.price),
        discounted_price: Number(selectedPlan.discounted_price || selectedPlan.price),
        currency: selectedPlan.currency,
        interval: selectedPlan.interval,
        trial_days: Number(selectedPlan.trial_days),
        features: featuresString,
        is_active: selectedPlan.is_active,
      });
    } else {
      methods.reset({
        name: '',
        description: '',
        price: 0,
        discounted_price: 0,
        currency: 'ETB',
        interval: 'M',
        trial_days: 0,
        features: '',
        is_active: true,
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
      await PlanService.createPlan({ ...data, business: businessId });
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Plan created successfully',
      });
      setShowAddPlan(false);
      methods.reset();
      await loadPlans(); // Wait for plans to refresh
    } catch (err) {
      console.error('Error creating plan:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create plan',
      });
    }
  };

  const handleUpdatePlan = async (planId: number, data: UpdatePlanData) => {
    try {
      await PlanService.updatePlan(planId, data);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Plan updated successfully',
      });
      setSelectedPlan(null); // Close modal
      methods.reset(); // Reset form
      loadPlans(); // Refresh plans list
    } catch (err) {
      console.error('Error updating plan:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update plan',
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await PlanService.deletePlan(id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Plan deleted successfully',
      });
      setShowDeleteModal(false);
      setPlanToDelete(null);
      loadPlans(); // Refresh the plans list
    } catch (err) {
      console.error('Error deleting plan:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete plan',
      });
    }
  };

  const handleConnectDiscount = async (planId: number, discountId: string) => {
    try {
      await PlanService.applyDiscount(planId, discountId);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Discount connected successfully',
      });
      setShowDiscountModal(false);
      setSelectedDiscount(null);
      loadPlans(); // Refresh the plans list
    } catch (err) {
      console.error('Error connecting discount:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to connect discount',
      });
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

  const onSubmit = async (data: PlanFormData) => {
    try {
      // Get features as string
      const features = data.features || '';

      const price = Number(data.price) || 0;
      
      const planData = {
        business: businessId,
        name: data.name || '',
        description: data.description || '',
        interval: data.interval || 'M',
        price: price,
        discounted_price: selectedPlan ? (Number(data.discounted_price) || price) : price, // Always use price as fallback
        currency: 'ETB',
        trial_days: Number(data.trial_days) || 0,
        features: features,
        is_active: data.is_active === 'true' || data.is_active === true
      };

      if (selectedPlan) {
        await PlanService.updatePlan(selectedPlan.id, planData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Plan updated successfully',
        });
      } else {
        await PlanService.createPlan(planData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Plan created successfully',
        });
      }

      setShowAddPlan(false);
      setSelectedPlan(null);
      methods.reset();
      loadPlans();
    } catch (error) {
      console.error('Error submitting plan:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error saving plan',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Plans</h1>
        <button
          onClick={() => {
            setSelectedPlan(null);
            setShowAddPlan(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Plan
        </button>
      </div>

      {/* Plan Form Modal */}
      {(showAddPlan || selectedPlan) && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-[95%] max-w-4xl p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedPlan ? 'Edit Plan' : 'Add New Plan'}
            </h2>
            {/* Form content */}
            <form onSubmit={methods.handleSubmit(onSubmit)} className="p-4 sm:p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...methods.register('name')}
                      className="mt-1 w-full rounded-lg border bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      placeholder="Basic Plan"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      {...methods.register('description')}
                      className="mt-1 w-full rounded-lg border bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      placeholder="Basic features for small businesses"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">ETB</span>
                      </div>
                      <input
                        type="float"
                        id="price"
                        {...methods.register('price')}
                        min="0"
                        className="w-full rounded-lg border bg-white pl-10 pr-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  {selectedPlan && (
                    <div>
                      <label htmlFor="discounted_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Discounted Price <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">ETB</span>
                        </div>
                        <input
                          type="float"
                          id="discounted_price"
                          {...methods.register('discounted_price')}
                          min="0"
                          className="w-full rounded-lg border bg-white pl-10 pr-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label htmlFor="interval" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Billing Interval <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="interval"
                      {...methods.register('interval')}
                      className="mt-1 w-full rounded-lg border bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      required
                    >
                      <option value="D">Daily</option>
                      <option value="W">Weekly</option>
                      <option value="M">Monthly</option>
                      <option value="Y">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="trial_days" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Trial Period (days)
                    </label>
                    <input
                      type="number"
                      id="trial_days"
                      {...methods.register('trial_days')}
                      min="0"
                      className="mt-1 w-full rounded-lg border bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="is_active"
                      {...methods.register('is_active')}
                      className="mt-1 w-full rounded-lg border bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      required
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="features" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Features (one per line)
                  </label>
                  <textarea
                    id="features"
                    {...methods.register('features')}
                    rows={4}
                    className="mt-1 w-full rounded-lg border bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder={`Feature 1\nFeature 2\nFeature 3`}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPlan(false);
                    setSelectedPlan(null);
                    methods.reset();
                  }}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-brand-600 rounded hover:bg-brand-700"
                >
                  {selectedPlan ? 'Update Plan' : 'Add Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Delete Plan</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this plan? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPlanToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (planToDelete !== null) {
                    handleDelete(planToDelete);
                  }
                  setShowDeleteModal(false);
                  setPlanToDelete(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connect Discount Modal */}
      {showDiscountModal && selectedPlan && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Connect Discount to Plan</h2>
            <div className="space-y-4">
              {discounts.map((discount) => (
                <div
                  key={discount.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div>
                    <h3 className="font-medium">{discount.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {discount.discount_type === 'P' 
                        ? `${discount.discount_value}% off` 
                        : `ETB ${discount.discount_value} off`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleConnectDiscount(selectedPlan.id, discount.id);
                      setShowDiscountModal(false);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowDiscountModal(false);
                  setSelectedPlan(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setShowAddPlan(true);
                  }}
                  className="p-2 text-blue-500 hover:text-blue-600"
                >
                  <FiEdit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setPlanToDelete(plan.id);
                    setShowDeleteModal(true);
                  }}
                  className="p-2 text-red-500 hover:text-red-600"
                >
                  <FiTrash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Price:</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {plan.price} {plan.currency}
                  {plan.discounted_price !== plan.price && (
                    <>
                      <span className="mx-2 text-gray-400">→</span>
                      <span className="text-green-600 dark:text-green-400">
                        {plan.discounted_price} {plan.currency}
                      </span>
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Interval:</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {plan.interval === 'D' ? 'Daily' :
                   plan.interval === 'W' ? 'Weekly' :
                   plan.interval === 'M' ? 'Monthly' :
                   'Yearly'}
                </span>
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
                  {(plan.features?.split('\n') || []).map((feature, index) => (
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
        ))}
      </div>
    </div>
  );
}
