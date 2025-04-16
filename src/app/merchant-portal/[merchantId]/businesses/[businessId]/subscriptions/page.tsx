'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Subscription, subscriptionService } from '@/services/subscriptionService';
import { Customer, customerService } from '@/services/customerService';
import { Plan, PlanService } from '@/services/planService';
import { XIcon } from '@/components/icons';
import { useNotification } from '@/context/NotificationContext';
import { FiCalendar } from 'react-icons/fi';
import { useParams } from 'next/navigation';

interface Notification {
  type: 'success' | 'error';
  title: string;
  message: string;
}

interface Payment {
  id: number;
  created_at: string;
  amount: string;
  status: 'C' | 'P' | 'F';
}

interface EditSubscriptionData {
  status?: 'AC' | 'PD' | 'CN' | 'TR' | 'EX';
  plan_id?: number;
  start_date?: string;
  end_date?: string;
  trial_end?: string | null;
  use_trial?: boolean;
}

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'AC':
      return 'Active';
    case 'PD':
      return 'Pending';
    case 'CN':
      return 'Cancelled';
    case 'TR':
      return 'Trial';
    case 'EX':
      return 'Expired';
    default:
      return 'Unknown';
  }
};

const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'AC':
      return 'bg-green-100 text-green-800';
    case 'PD':
      return 'bg-yellow-100 text-yellow-800';
    case 'CN':
      return 'bg-red-100 text-red-800';
    case 'TR':
      return 'bg-blue-100 text-blue-800';
    case 'EX':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const calculateTrialEndDate = (startDate: string, plan: Plan): string => {
  try {
    if (!plan.has_trial) return '';
    
    const date = new Date(startDate);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid start date');
    }
    
    date.setDate(date.getDate() + plan.trial_days);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error calculating trial end date:', error);
    // Return a default date 30 days from now as fallback
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    return defaultDate.toISOString().split('T')[0];
  }
};

const calculateNextBillingDate = (startDate: string, plan: Plan, useTrial: boolean = false): string => {
  try {
    const date = new Date(startDate);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid start date');
    }
    
    // If using trial, first billing date starts after trial
    if (useTrial && plan.has_trial) {
      date.setDate(date.getDate() + plan.trial_days);
    }
    
    const currentMonth = date.getMonth();
    
    switch(plan.interval) {
      case 'D':
        date.setDate(date.getDate() + 1);
        break;
      case 'W':
        date.setDate(date.getDate() + 7);
        break;
      case 'M':
        date.setMonth(currentMonth + 1);
        // Handle month overflow
        if (date.getMonth() !== ((currentMonth + 1) % 12)) {
          date.setDate(0);
        }
        break;
      case 'Y':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error calculating next billing date:', error);
    // Return a default date 1 month from now as fallback
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() + 1);
    return defaultDate.toISOString().split('T')[0];
  }
};

const calculateEndDate = (startDate: string, plan: Plan, useTrial: boolean = false): string => {
  try {
    const date = new Date(startDate);

    // If using trial, subscription duration starts after trial
    if (useTrial && plan.has_trial) {
      date.setDate(date.getDate() + plan.trial_days);
    }
    
    // Add subscription duration based on interval
    switch (plan.interval) {
      case 'D':
        date.setDate(date.getDate() + 1);
        break;
      case 'W':
        date.setDate(date.getDate() + 7);
        break;
      case 'M':
        date.setMonth(date.getMonth() + 1);
        // Handle month overflow (e.g., Jan 31 + 1 month should go to Feb 28/29)
        if (date.getDate() < new Date(startDate).getDate()) {
          date.setDate(0); // Set to last day of previous month
        }
        break;
      case 'Y':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        throw new Error('Invalid interval');
    }

    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error calculating end date:', error);
    // Return a default date 1 year from now as fallback
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() + 1);
    return defaultDate.toISOString().split('T')[0];
  }
};

function SubscriptionsContent() {
  const params = useParams();
  const businessId = params?.businessId as string;
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showAddSubscription, setShowAddSubscription] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [editSubscriptionData, setEditSubscriptionData] = useState<EditSubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'AC' | 'PD' | 'CN' | 'TR' | 'EX'>('all');
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSubscriptionCreate, setPendingSubscriptionCreate] = useState<{
    existingSubscription: Subscription | null;
    newSubscriptionData: any;
  } | null>(null);
  const { addNotification } = useNotification();

  const [formData, setFormData] = useState({
    business: Number(businessId),
    plan_id: 0,
    customer_id: 0,
    start_date: new Date().toISOString().split('T')[0],
    use_trial: false
  });

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      let matches = true;

      // Search filter
      if (searchQuery.trim()) {
        const searchTerms = searchQuery.toLowerCase().trim();
        const customerName = `${sub.customer.first_name} ${sub.customer.last_name}`.toLowerCase();
        const customerEmail = sub.customer.email.toLowerCase();
        const planName = sub.plan.name.toLowerCase();
        const status = getStatusLabel(sub.status).toLowerCase();
        
        matches = customerName.includes(searchTerms) ||
                 customerEmail.includes(searchTerms) ||
                 planName.includes(searchTerms) ||
                 status.includes(searchTerms);
      }

      // Status filter
      if (matches && statusFilter !== 'all') {
        matches = sub.status === statusFilter;
      }

      return matches;
    });
  }, [subscriptions, searchQuery, statusFilter]);

  useEffect(() => {
    loadSubscriptions();
    loadCustomers();
    loadPlans();
  }, [businessId]);

  const loadSubscriptions = async () => {
    try {
      const response = await subscriptionService.getSubscriptions(String(businessId));
      setSubscriptions(response);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load subscriptions. Please try again.'
      });
    }
  };

  const loadPaymentHistory = async (subscriptionId: number) => {
    try {
      const payments = await subscriptionService.getPaymentHistory(subscriptionId);
      setPaymentHistory(payments);
    } catch (error) {
      console.error('Error loading payment history:', error);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load payment history'
      });
    }
  };

  const handleViewDetails = async (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowDetails(subscription.id);
    await loadPaymentHistory(subscription.id);
  };

  const handleConvertTrial = async (subscriptionId: number) => {
    try {
      setLoading(true);
      const updatedSubscription = await subscriptionService.convertTrialToActive(subscriptionId);
      setSubscriptions(prevSubscriptions =>
        prevSubscriptions.map(sub =>
          sub.id === subscriptionId ? updatedSubscription : sub
        )
      );
      setNotification({
        type: 'success',
        title: 'Success',
        message: 'Trial converted to active subscription'
      });
    } catch (error) {
      console.error('Error converting trial:', error);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to convert trial to active subscription'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubscription || !editSubscriptionData) return;

    try {
      setLoading(true);

      // Get current plan and new plan if changed
      const currentPlan = editingSubscription.plan;
      const newPlanId = editSubscriptionData.plan_id || currentPlan.id;
      const selectedPlan = plans.find(p => p.id === newPlanId);
      
      if (!selectedPlan) {
        throw new Error('Selected plan not found');
      }

      // Calculate new dates if plan changed or trial status changed
      const startDate = editSubscriptionData.start_date || editingSubscription.start_date;
      const endDate = calculateEndDate(startDate, selectedPlan, editSubscriptionData.use_trial);
      const trialEndDate = editSubscriptionData.use_trial ? calculateTrialEndDate(startDate, selectedPlan) : null;
      const nextBillingDate = calculateNextBillingDate(startDate, selectedPlan, editSubscriptionData.use_trial);

      const updatedData = {
        ...editSubscriptionData,
        business: Number(businessId),
        end_date: endDate,
        trial_end: trialEndDate,
        next_billing_date: nextBillingDate,
        plan_id: newPlanId
      };

      const updated = await subscriptionService.updateSubscription(
        editingSubscription.id,
        updatedData
      );

      setSubscriptions(prevSubscriptions =>
        prevSubscriptions.map(sub =>
          sub.id === editingSubscription.id ? updated : sub
        )
      );

      setNotification({
        type: 'success',
        title: 'Success',
        message: 'Subscription updated successfully'
      });

      setEditMode(false);
      setEditingSubscription(null);
      setEditSubscriptionData(null);
    } catch (error) {
      console.error('Error updating subscription:', error);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update subscription'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id || !formData.plan_id) return;

    try {
      setLoading(true);

      // Check if customer has active subscription
      const existingSubscription = subscriptions.find(
        sub => sub.customer.id === formData.customer_id && sub.status === 'AC'
      );

      if (existingSubscription) {
        setPendingSubscriptionCreate({
          existingSubscription,
          newSubscriptionData: { ...formData }
        });
        setShowConfirmModal(true);
        return;
      }

      await createNewSubscription(formData);

    } catch (error) {
      console.error('Error creating subscription:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create subscription'
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewSubscription = async (data: any) => {
    const selectedPlan = plans.find(p => p.id === data.plan_id);
    if (!selectedPlan) {
      throw new Error('Selected plan not found');
    }

    const startDate = data.start_date;
    const endDate = calculateEndDate(startDate, selectedPlan, data.use_trial);
    const trialEndDate = data.use_trial ? calculateTrialEndDate(startDate, selectedPlan) : null;
    const nextBillingDate = calculateNextBillingDate(startDate, selectedPlan, data.use_trial);
    
    const initialStatus = data.use_trial && selectedPlan.has_trial ? 'TR' : 'AC';

    const newSubscription = await subscriptionService.createSubscription({
      ...data,
      business: Number(businessId),
      end_date: endDate,
      trial_end: trialEndDate,
      next_billing_date: nextBillingDate,
      status: initialStatus
    });

    setSubscriptions(prev => [...prev, newSubscription]);
    addNotification({
      type: 'success',
      title: 'Success',
      message: 'Subscription created successfully'
    });

    setShowAddSubscription(false);
    resetFormData();
  };

  const handleConfirmSubscriptionCreate = async () => {
    if (!pendingSubscriptionCreate?.existingSubscription) return;

    try {
      setLoading(true);
      const { existingSubscription, newSubscriptionData } = pendingSubscriptionCreate;

      // Cancel existing subscription
      await subscriptionService.updateSubscription(existingSubscription.id, {
        status: 'CN' as const,
        end_date: new Date().toISOString().split('T')[0]
      });

      // Create new subscription
      await createNewSubscription(newSubscriptionData);

    } catch (error) {
      console.error('Error handling subscription:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to handle subscription'
      });
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
      setPendingSubscriptionCreate(null);
    }
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditSubscriptionData({
      start_date: subscription.start_date,
      status: subscription.status
    });
    setEditMode(true);
    setShowAddSubscription(true);
    setEditingSubscription(subscription);
  };

  const handleRenewSubscription = (subscription: Subscription) => {
    setEditSubscriptionData({
      start_date: subscription.end_date,
      status: subscription.status
    });
    setEditMode(true);
    setShowAddSubscription(true);
    setEditingSubscription(subscription);
  };

  const handleDeleteSubscription = async (id: number) => {
    try {
      await subscriptionService.deleteSubscription(id);
      setSubscriptions(subscriptions.filter(sub => sub.id !== id));
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Subscription deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting subscription:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete subscription. Please try again.'
      });
    }
  };

  const handleCancelSubscription = async (subscriptionId: number) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }

    try {
      setLoading(true);
      await subscriptionService.cancelSubscription(subscriptionId);
      await loadSubscriptions();
      setNotification({
        type: 'success',
        title: 'Success',
        message: 'Subscription cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to cancel subscription'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerService.getCustomers(String(businessId));
      setCustomers(response);
    } catch (error) {
      console.error('Error loading customers:', error);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load customers. Please try again.'
      });
    }
  };

  const loadPlans = async () => {
    try {
      const response = await PlanService.getPlans(String(businessId));
      setPlans(response);
    } catch (error) {
      console.error('Error loading plans:', error);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load plans. Please try again.'
      });
    }
  };

  const handlePlanChange = (planId: number) => {
    setFormData(prev => ({
      ...prev,
      plan_id: planId
    }));
  };

  const handleCustomerChange = (customerId: number) => {
    setFormData(prev => ({
      ...prev,
      customer_id: customerId
    }));
  };

  const resetFormData = () => {
    setFormData({
      business: Number(businessId),
      plan_id: 0,
      customer_id: 0,
      start_date: new Date().toISOString().split('T')[0],
      use_trial: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Subscriptions</h1>
        <button
          onClick={() => setShowAddSubscription(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-md hover:bg-brand-600"
        >
          Add Subscription
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">All Status</option>
          <option value="AC">Active</option>
          <option value="PD">Past Due</option>
          <option value="CN">Cancelled</option>
          <option value="TR">Trial</option>
          <option value="EX">Expired</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <div className="relative -mx-4 sm:mx-0">
        <div className="overflow-x-auto min-w-full border-x border-gray-200 dark:border-gray-700 sm:border-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-[900px] w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Trial End
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSubscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {sub.customer.first_name} {sub.customer.last_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {sub.customer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{sub.plan.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {sub.plan.price} / {sub.plan.interval}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(sub.status)}`}>
                        {getStatusLabel(sub.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(sub.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {sub.trial_end ? new Date(sub.trial_end).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(sub.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDetails(sub)}
                        className="text-brand-500 hover:text-brand-700"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleEditSubscription(sub)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      {sub.status === 'TR' && (
                        <button
                          onClick={() => handleConvertTrial(sub.id)}
                          className="text-green-500 hover:text-green-700"
                        >
                          Convert to Active
                        </button>
                      )}
                      {/* {sub.status !== 'CN' && (
                        <button
                          onClick={() => handleCancelSubscription(sub.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Cancel
                        </button>
                      )} */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Subscription Details Modal */}
      {showDetails && selectedSubscription && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-gray-900 rounded-lg p-6 w-full max-w-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Subscription Details
              </h2>
              <button
                onClick={() => {
                  setShowDetails(null);
                  setSelectedSubscription(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedSubscription.customer.first_name} {selectedSubscription.customer.last_name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedSubscription.customer.email}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedSubscription.plan.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedSubscription.plan.price} / {selectedSubscription.plan.interval}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                  <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(selectedSubscription.status)}`}>
                    {getStatusLabel(selectedSubscription.status)}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dates</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    Start: {new Date(selectedSubscription.start_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    End: {new Date(selectedSubscription.end_date).toLocaleDateString()}
                  </p>
                  {selectedSubscription.trial_end && (
                    <p className="text-sm text-gray-900 dark:text-white">
                      Trial End: {new Date(selectedSubscription.trial_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment History */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment History</h3>
                <div className="relative -mx-4 sm:mx-0">
                  <div className="overflow-x-auto min-w-full border-x border-gray-200 dark:border-gray-700 sm:border-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-[600px] w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                          {paymentHistory.map((payment) => (
                            <tr key={payment.id}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {new Date(payment.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {payment.amount}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  payment.status === 'C' ? 'bg-green-100 text-green-800' :
                                  payment.status === 'P' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {payment.status === 'C' ? 'Completed' :
                                   payment.status === 'P' ? 'Pending' : 'Failed'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Subscription Modal */}
      {(showAddSubscription || editMode) && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-gray-900 rounded-lg p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editMode ? 'Edit Subscription' : 'Add New Subscription'}
              </h2>
              <button
                onClick={() => {
                  setShowAddSubscription(false);
                  setEditMode(false);
                  setEditingSubscription(null);
                  setEditSubscriptionData(null);
                  resetFormData();
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={editMode ? handleUpdateSubscription : handleCreateSubscription} className="space-y-4">
              {!editMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customer
                  </label>
                  <select
                    value={formData.customer_id || ''}
                    onChange={(e) => setFormData({ ...formData, customer_id: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name} ({customer.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Plan
                </label>
                <select
                  value={editMode ? (editSubscriptionData?.plan_id || editingSubscription?.plan.id) : formData.plan_id || ''}
                  onChange={(e) => {
                    const planId = Number(e.target.value);
                    const selectedPlan = plans.find(p => p.id === planId);
                    if (selectedPlan) {
                      if (editMode) {
                        const startDate = editSubscriptionData?.start_date || editingSubscription?.start_date;
                        const endDate = calculateEndDate(startDate!, selectedPlan, editSubscriptionData?.use_trial);
                        const trialEndDate = editSubscriptionData?.use_trial ? calculateTrialEndDate(startDate!, selectedPlan) : null;
                        setEditSubscriptionData(prev => ({
                          ...prev!,
                          plan_id: planId,
                          end_date: endDate,
                          trial_end: trialEndDate,
                          use_trial: selectedPlan.has_trial ? (prev?.use_trial || false) : false
                        }));
                      } else {
                        const startDate = formData.start_date;
                        const useTrial = selectedPlan.has_trial && formData.use_trial;
                        const endDate = calculateEndDate(startDate, selectedPlan, useTrial);
                        const trialEndDate = useTrial ? calculateTrialEndDate(startDate, selectedPlan) : null;
                        
                        setFormData(prev => ({
                          ...prev,
                          plan_id: planId,
                          use_trial: false, // Reset trial when plan changes
                          end_date: endDate,
                          trial_end: trialEndDate
                        }));
                      }
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  required
                >
                  <option value="">Select Plan</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} ({plan.price} / {plan.interval})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Date
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={editMode ? editSubscriptionData?.start_date : formData.start_date}
                    onChange={(e) => {
                      const newStartDate = e.target.value;
                      if (editMode) {
                        const plan = plans.find(p => p.id === (editSubscriptionData?.plan_id || editingSubscription?.plan.id));
                        if (plan) {
                          const endDate = calculateEndDate(newStartDate, plan, editSubscriptionData?.use_trial);
                          const trialEndDate = editSubscriptionData?.use_trial ? calculateTrialEndDate(newStartDate, plan) : null;
                          setEditSubscriptionData(prev => ({
                            ...prev!,
                            start_date: newStartDate,
                            end_date: endDate,
                            trial_end: trialEndDate
                          }));
                        }
                      } else {
                        const plan = plans.find(p => p.id === formData.plan_id);
                        if (plan) {
                          const endDate = calculateEndDate(newStartDate, plan, formData.use_trial);
                          const trialEndDate = formData.use_trial ? calculateTrialEndDate(newStartDate, plan) : null;
                          setFormData(prev => ({
                            ...prev,
                            start_date: newStartDate,
                            end_date: endDate,
                            trial_end: trialEndDate
                          }));
                        }
                      }
                    }}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    required
                  />
                </div>
              </div>

              {editMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    value={editSubscriptionData?.status || ''}
                    onChange={(e) => setEditSubscriptionData(prev => ({ ...prev!, status: e.target.value as any }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  >
                    <option value="AC">Active</option>
                    <option value="PD">Past Due</option>
                    <option value="CN">Cancelled</option>
                    <option value="TR">Trial</option>
                    <option value="EX">Expired</option>
                  </select>
                </div>
              )}

              {!editMode && formData.plan_id && plans.find(p => p.id === formData.plan_id)?.has_trial && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="use_trial"
                    checked={formData.use_trial}
                    onChange={(e) => {
                      const useTrial = e.target.checked;
                      const plan = plans.find(p => p.id === formData.plan_id);
                      if (plan) {
                        const endDate = calculateEndDate(formData.start_date, plan, useTrial);
                        const trialEndDate = useTrial ? calculateTrialEndDate(formData.start_date, plan) : null;
                        setFormData(prev => ({
                          ...prev,
                          use_trial: useTrial,
                          end_date: endDate,
                          trial_end: trialEndDate
                        }));
                      }
                    }}
                    className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                  />
                  <label htmlFor="use_trial" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Start with trial period ({plans.find(p => p.id === formData.plan_id)?.trial_days} days)
                  </label>
                </div>
              )}

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSubscription(false);
                    setEditMode(false);
                    setEditingSubscription(null);
                    setEditSubscriptionData(null);
                    resetFormData();
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (editMode ? 'Saving...' : 'Creating...') : (editMode ? 'Save Changes' : 'Create Subscription')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && pendingSubscriptionCreate && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-gray-900 rounded-lg p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Subscription Change
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This customer already has an active subscription. Would you like to cancel it and create a new one?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingSubscriptionCreate(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubscriptionCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionsContent;
