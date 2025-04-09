'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import { Subscription, CreateSubscriptionData, UpdateSubscriptionData } from '@/services/subscriptionService';
import { subscriptionService } from '@/services/subscriptionService';
import { Customer } from '@/services/customerService';
import { customerService } from '@/services/customerService';
import { Plan } from '@/services/planService';
import { PlanService } from '@/services/planService';
import { FiCalendar } from 'react-icons/fi';

interface ReportMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
}

export default function SubscriptionsPage() {
  const params = useParams();
  const businessId = params?.businessId && Array.isArray(params.businessId) ? params.businessId[0] : params?.businessId;
  const merchantId = params?.merchantId && Array.isArray(params.merchantId) ? params.merchantId[0] : params?.merchantId;

  if (!businessId || !merchantId) {
    return <div className="text-red-500">Business ID or Merchant ID not found</div>;
  }

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'AC' | 'PD' | 'CN' | 'TR' | 'EX'>('all');
  const [showAddSubscription, setShowAddSubscription] = useState(false);
  const [formData, setFormData] = useState<CreateSubscriptionData>({
    business: Number(businessId),
    plan_id: 0,
    customer_id: 0,
    start_date: new Date().toISOString().split('T')[0]
  });
  const [metrics, setMetrics] = useState<ReportMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const { addNotification } = useNotification();

  const loadSubscriptions = async () => {
    try {
      const response = await subscriptionService.getSubscriptions(String(businessId));
      setSubscriptions(response);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setError('Failed to load subscriptions. Please try again.');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load subscriptions. Please try again.'
      });
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerService.getCustomers(String(businessId));
      setCustomers(response);
    } catch (error) {
      console.error('Error loading customers:', error);
      setError('Failed to load customers. Please try again.');
      addNotification({
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
      setError('Failed to load plans. Please try again.');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load plans. Please try again.'
      });
    }
  };

  useEffect(() => {
    if (businessId) {
      loadSubscriptions();
      loadCustomers();
      loadPlans();
    }
  }, [businessId]);

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const customerName = `${sub.customer.first_name} ${sub.customer.last_name}`;
      const planName = sub.plan.name;
      if (!customerName.toLowerCase().includes(query) && 
          !planName.toLowerCase().includes(query) && 
          !getStatusLabel(sub.status).toLowerCase().includes(query)) {
        return false;
      }
    }
    if (statusFilter !== 'all' && sub.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const calculateDates = (plan: Plan, startDate: string) => {
    const start = new Date(startDate);
    const interval = plan.interval;
    
    // Calculate end date based on interval
    let end = new Date(start);
    switch(interval) {
      case 'D':
        end.setDate(end.getDate() + 1);
        break;
      case 'W':
        end.setDate(end.getDate() + 7);
        break;
      case 'M':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'Y':
        end.setFullYear(end.getFullYear() + 1);
        break;
    }

    // Calculate next billing date (same as end date for simplicity)
    const nextBilling = new Date(end);

    return {
      end_date: end.toISOString().split('T')[0],
      next_billing_date: nextBilling.toISOString().split('T')[0]
    };
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
      start_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plan_id || !formData.customer_id) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select both a customer and a plan'
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await subscriptionService.createSubscription({
        business: Number(businessId),
        plan_id: formData.plan_id,
        customer_id: formData.customer_id,
        start_date: formData.start_date
      });
      
      await loadSubscriptions();
      
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Subscription created successfully'
      });
      
      setShowAddSubscription(false);
      resetFormData();
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create subscription. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async (id: number, data: UpdateSubscriptionData) => {
    try {
      const response = await subscriptionService.updateSubscription(id, data);
      setSubscriptions(subscriptions.map(sub => 
        sub.id === id ? { ...sub, ...response } : sub
      ));
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Subscription updated successfully'
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update subscription. Please try again.'
      });
    }
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

  const getStatusLabel = (status: 'AC' | 'PD' | 'CN' | 'TR' | 'EX') => {
    const statusLabels = {
      'AC': 'Active',
      'PD': 'Past Due',
      'CN': 'Cancelled',
      'TR': 'Trial',
      'EX': 'Expired'
    };
    return statusLabels[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Subscriptions</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Manage and monitor your business subscriptions
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <metric.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  {metric.label}
                </h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {metric.value}
                </p>
                <div className="flex items-center mt-2">
                  <metric.icon
                    className={`h-5 w-5 ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}
                  />
                  <p className={`ml-2 text-sm font-medium ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                    {metric.change >= 0 ? '+' : ''}{metric.change}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, plan, or status..."
            className="w-full sm:w-auto rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-brand-500 dark:focus:ring-offset-gray-800"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <option value="all" className="text-gray-700 dark:text-gray-300">All Status</option>
            <option value="AC" className="text-gray-700 dark:text-gray-300">Active</option>
            <option value="PD" className="text-gray-700 dark:text-gray-300">Past Due</option>
            <option value="CN" className="text-gray-700 dark:text-gray-300">Cancelled</option>
            <option value="TR" className="text-gray-700 dark:text-gray-300">Trial</option>
            <option value="EX" className="text-gray-700 dark:text-gray-300">Expired</option>
          </select>
          <button
            onClick={() => setShowAddSubscription(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Add Subscription
          </button>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Next Billing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {sub.customer.first_name} {sub.customer.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {sub.plan.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      sub.status === 'AC' ? 'bg-green-100 text-green-800' :
                      sub.status === 'PD' ? 'bg-yellow-100 text-yellow-800' :
                      sub.status === 'CN' ? 'bg-red-100 text-red-800' :
                      sub.status === 'TR' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusLabel(sub.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(sub.start_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ${Number(sub.plan.price).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteSubscription(sub.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subscription Modal */}
      {showAddSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Add Subscription
            </h2>
            <form onSubmit={handleCreateSubscription}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.customer_id || ''}
                    onChange={(e) => handleCustomerChange(parseInt(e.target.value))}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 ${
                      !formData.customer_id ? 'border-red-300' : ''
                    }`}
                    required
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Plan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.plan_id || ''}
                    onChange={(e) => handlePlanChange(parseInt(e.target.value))}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 ${
                      !formData.plan_id ? 'border-red-300' : ''
                    }`}
                    required
                  >
                    <option value="">Select plan</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="date"
                      value={formData.start_date || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                      min={new Date().toISOString().split('T')[0]}
                      max={new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]} // 1 year from now
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSubscription(false);
                    resetFormData();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-md hover:bg-brand-600 disabled:opacity-50"
                  disabled={!formData.customer_id || !formData.plan_id || loading}
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
