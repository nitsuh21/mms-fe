'use client';

import { useState, useEffect, useMemo } from 'react';
import { Subscription, subscriptionService, CreateSubscriptionData } from '@/services/subscriptionService';
import { Customer, customerService } from '@/services/customerService';
import { Plan, PlanService } from '@/services/planService';
import { XIcon } from '@/components/icons';
import { useNotification } from '@/context/NotificationContext';
import { FiCalendar } from 'react-icons/fi';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import BulkActions from '@/components/common/BulkActions';
import TableCheckbox from '@/components/common/TableCheckbox';
import { CreateSubscriptionModal } from '@/components/subscriptions/CreateSubscriptionModal';


interface Payment {
  id: number;
  created_at: string;
  amount: string;
  status: 'C' | 'P' | 'F';
}

interface EditSubscriptionData {
  status?: 'AC' | 'PD' | 'CN' | 'TR' | 'EX' | 'PN';
  plan_id?: number;
  start_date?: string;
  end_date?: string;
  customer_id?: number;
  trial_end?: string | null;
  use_trial?: boolean;
}

const getStatusLabel = (status: string): string => {
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

const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'AC':
      return 'bg-green-100 text-green-800';
    case 'PN':
      return 'bg-blue-100 text-blue-800';  // Changed to blue to indicate pending review
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

const calculateTrialEndDate = (startDate: string, plan: Plan): string => {
  if (!plan.has_trial || !plan.trial_days || !startDate) return '';
  
  // Create a new date object from the start date
  const date = new Date(startDate);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid start date format');
  }
  
  // Validate trial days
  if (plan.trial_days <= 0) {
    throw new Error('Invalid trial days configuration');
  }
  
  // Add trial days to get the trial end date
  date.setDate(date.getDate() + plan.trial_days);
  
  // Return in YYYY-MM-DD format
  return date.toISOString().split('T')[0];
};

const calculateNextBillingDate = (startDate: string, plan: Plan, useTrial: boolean = false): string => {
  try {
    // For trial subscriptions, next billing is at trial end
    if (useTrial && plan.has_trial && plan.trial_days > 0) {
      return calculateTrialEndDate(startDate, plan);
    }
    
    // For non-trial subscriptions, calculate next billing based on interval
    const date = new Date(startDate);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid start date');
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
        // Handle month overflow (e.g., Jan 31 + 1 month should go to Feb 28/29)
        if (date.getMonth() !== ((currentMonth + 1) % 12)) {
          date.setDate(0);
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
    console.error('Error calculating next billing date:', error);
    // Return a default date 1 month from now as fallback
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() + 1);
    return defaultDate.toISOString().split('T')[0];
  }
};

const calculateEndDate = (startDate: string, plan: Plan): string => {
  try {
    const date = new Date(startDate);
    
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

interface SubscriptionFormData {
  business: number;
  plan_id: number;
  customer_id: number;
  start_date: string;
  use_trial: boolean;
}

function SubscriptionsContent() {
  const params = useParams() as { businessId: string; merchantId: string } | null;
  const { addNotification } = useNotification();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showAddSubscription, setShowAddSubscription] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [editMode, setEditMode] = useState(false);
  // Payment history state management will be implemented in future updates
  const [editSubscriptionData, setEditSubscriptionData] = useState<EditSubscriptionData | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [formData, setFormData] = useState<SubscriptionFormData>({
    business: Number(params?.businessId),
    plan_id: 0,
    customer_id: 0,
    start_date: new Date().toISOString().split('T')[0],
    use_trial: false
  });

  if (!params?.businessId) {
    return <div>Loading...</div>;
  }

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((subscription) => {
      const customerName = `${subscription.customer.first_name} ${subscription.customer.last_name}`.toLowerCase();
      const matchesSearch = customerName.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, searchQuery, statusFilter]);

  useEffect(() => {
    if (params?.businessId) {
      loadSubscriptions();
      loadCustomers();
      loadPlans();
    }
  }, [params?.businessId]);

  const loadSubscriptions = async () => {
    try {
      const response = await subscriptionService.getSubscriptions(params?.businessId);
      setSubscriptions(response);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      addNotification({
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
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load payment history'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (subscription: Subscription) => {
    window.location.href = `/merchant-portal/${params.merchantId}/businesses/${params.businessId}/subscriptions/${subscription.id}`;
  };

  const handleConvertTrial = async (subscriptionId: number) => {
    try {
      setLoading(true);
      const updatedSubscription = await subscriptionService.convertTrialToActive(subscriptionId);
      setSubscriptions((prevSubscriptions) =>
        prevSubscriptions.map((sub) =>
          Number(sub.id) === subscriptionId ? updatedSubscription : sub
        )
      );
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Trial converted to active subscription'
      });
    } catch (error) {
      console.error('Error converting trial:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to convert trial to active subscription'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSubscription || !editSubscriptionData) return;

    try {
      setLoading(true);
      // Convert trial_end to undefined if it's null
      const updateData = {
        ...editSubscriptionData,
        trial_end: editSubscriptionData.trial_end || undefined
      };
      await subscriptionService.updateSubscription(editingSubscription.id, updateData);
      loadSubscriptions();
      setShowAddSubscription(false);
      setEditMode(false);
      setEditingSubscription(null);
      setEditSubscriptionData(null);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Subscription updated successfully',
      });
    } catch (error: unknown) {
      console.error('Error updating subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update subscription';
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage,
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
      
      // Validate form data
      if (!formData.customer_id || !formData.plan_id || !formData.start_date) {
        throw new Error('Please fill in all required fields');
      }

      const selectedPlan = plans.find((p) => p.id === formData.plan_id);
      if (!selectedPlan) {
        throw new Error('Selected plan not found');
      }

      // Validate dates
      const startDate = new Date(formData.start_date);
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start date');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        throw new Error('Start date cannot be in the past');
      }

      // Determine if we should use trial based on plan settings
      const useTrial = selectedPlan.has_trial && selectedPlan.trial_days > 0;
      
      // Calculate dates
      const trialEndDate = useTrial ? calculateTrialEndDate(formData.start_date, selectedPlan) : undefined;
      const nextBillingDate = useTrial && trialEndDate ? trialEndDate : formData.start_date; // If trial, first billing is at trial end
      const endDate = calculateEndDate(useTrial && trialEndDate ? trialEndDate : formData.start_date, selectedPlan); // End date starts after trial
      
      const subscriptionData: CreateSubscriptionData = {
        ...formData,
        business: Number(params.businessId),
        end_date: endDate,
        trial_end: trialEndDate || undefined, // Convert null to undefined if needed
        next_billing_date: nextBillingDate,
        status: useTrial ? 'TR' : 'AC', // Trial status if using trial
        use_trial: useTrial
      };

      const newSubscription = await subscriptionService.createSubscription(subscriptionData);

      setSubscriptions((prev: Subscription[]) => [...prev, newSubscription]);
      setShowAddSubscription(false);
      resetFormData();
      
      addNotification({
        type: 'success',
        title: 'Success',
        message: useTrial
          ? `Trial subscription created. Trial ends on ${new Date(trialEndDate!).toLocaleDateString()}`
          : 'Subscription created successfully'
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create subscription';
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };


  const handleEditSubscription = (subscription: Subscription) => {
    setEditSubscriptionData({
      start_date: subscription.start_date,
      status: subscription.status,
      customer_id: subscription.customer.id
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
      setSubscriptions(subscriptions.filter((sub) => Number(sub.id) !== id));
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
    try {
      setLoading(true);
      await subscriptionService.cancelSubscription(subscriptionId);
      loadSubscriptions();
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Subscription cancelled successfully',
      });
    } catch (error: unknown) {
      console.error('Error cancelling subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription';
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerService.getCustomers();
      setCustomers(response);
    } catch (error) {
      console.error('Error loading customers:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load customers',
      });
    }
  };

  const loadPlans = async () => {
    try {
      const response = await PlanService.getPlans(params.businessId);
      setPlans(response);
    } catch (error) {
      console.error('Error loading plans:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load plans. Please try again.'
      });
    }
  };

  const handlePlanChange = (planId: number) => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan) {
      // If plan has trial, automatically enable it
      const useTrial = selectedPlan.has_trial && selectedPlan.trial_days > 0;
      const endDate = calculateEndDate(formData.start_date, selectedPlan);
      const trialEndDate = useTrial ? calculateTrialEndDate(formData.start_date, selectedPlan) : undefined;
      
      setFormData(prev => ({
        ...prev,
        plan_id: planId,
        use_trial: useTrial,
        end_date: endDate,
        trial_end: trialEndDate
      }));
    }
  };

  const handleCustomerChange = (customerId: number) => {
    setFormData(prev => ({
      ...prev,
      customer_id: customerId
    }));
  };

  const resetFormData = () => {
    setFormData({
      business: Number(params.businessId),
      plan_id: 0,
      customer_id: 0,
      start_date: new Date().toISOString().split('T')[0],
      use_trial: false
    });
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredSubscriptions.map(subscription => subscription.id);
      setSelectedSubscriptions(new Set(allIds));
    } else {
      setSelectedSubscriptions(new Set());
    }
  };

  const handleSelectSubscription = (subscriptionId: string, checked: boolean) => {
    const newSelected = new Set(selectedSubscriptions);
    if (checked) {
      newSelected.add(subscriptionId);
    } else {
      newSelected.delete(subscriptionId);
    }
    setSelectedSubscriptions(newSelected);
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const selectedCount = selectedSubscriptions.size;
      for (const subscriptionId of selectedSubscriptions) {
        await subscriptionService.cancelSubscription(Number(subscriptionId));
      }
      setSubscriptions(prev => prev.filter(s => !selectedSubscriptions.has(s.id)));
      setSelectedSubscriptions(new Set());
      addNotification({
        type: 'success',
        title: 'Success',
        message: `${selectedCount} subscriptions cancelled successfully`,
      });
    } catch (error) {
      console.error('Bulk delete failed:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to cancel some subscriptions',
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedSubscriptions(new Set());
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
        <BulkActions
          selectedItems={Array.from(selectedSubscriptions)}
          onDeleteSelected={handleBulkDelete}
          onClearSelection={handleClearSelection}
          itemName="subscriptions"
          isLoading={isBulkDeleting}
        />
        
        <div className="overflow-x-auto min-w-full border-x border-gray-200 dark:border-gray-700 sm:border-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-[900px] w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <TableCheckbox
                      checked={filteredSubscriptions.length > 0 && selectedSubscriptions.size === filteredSubscriptions.length}
                      onChange={handleSelectAll}
                    />
                  </th>
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
                      <TableCheckbox
                        checked={selectedSubscriptions.has(sub.id)}
                        onChange={(checked) => handleSelectSubscription(sub.id, checked)}
                      />
                    </td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/merchant-portal/${params.merchantId}/businesses/${params.businessId}/subscriptions/${sub.id}`}
                          className="text-brand-600 hover:text-brand-900"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleEditSubscription(sub)}
                          className="text-brand-600 hover:text-brand-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSubscription(Number(sub.id))}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                        {sub.status === 'CN' && (
                          <button
                            onClick={() => handleRenewSubscription(sub)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Renew
                          </button>
                        )}
                        {sub.status === 'TR' && (
                          <button
                            onClick={() => handleConvertTrial(Number(sub.id))}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Convert to Active
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Subscription Details Modal */}
      {selectedSubscription && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-gray-900 rounded-lg p-6 w-full max-w-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Subscription Details
              </h2>
              <button
                onClick={() => {
                  setSelectedSubscription(null);
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
                          {paymentHistory.map((payment: Payment) => (
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

      {/* Create Subscription Modal */}
      <CreateSubscriptionModal
        isOpen={showAddSubscription && !editMode}
        onClose={() => {
          setShowAddSubscription(false);
          resetFormData();
        }}
        onSuccess={() => {
          setShowAddSubscription(false);
          loadSubscriptions();
        }}
      />
    </div>
  );
}

export default SubscriptionsContent;
