'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotification } from '@/context/NotificationContext';
import { subscriptionService } from '@/services/subscriptionService';
import { Customer, customerService, CreateCustomerData } from '@/services/customerService';
import { Plan, PlanService } from '@/services/planService';
import { 
  FiCalendar, 
  FiSearch, 
  FiUserPlus, 
  FiInfo,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';

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
  const params = useParams();
  const businessId = params?.businessId as string;
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  
  // Search states
  const [customerSearch, setCustomerSearch] = useState('');
  const [planSearch, setPlanSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  
  // Quick create states
  const [showQuickCreateCustomer, setShowQuickCreateCustomer] = useState(false);
  const [quickCreateLoading, setQuickCreateLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    use_trial: false,
  });

  // Quick create customer form
  const [newCustomer, setNewCustomer] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      loadPlans();
      // Reset form
      setFormData({
        customer_id: '',
        plan_id: '',
        start_date: new Date().toISOString().split('T')[0],
        use_trial: false,
      });
      setCustomerSearch('');
      setPlanSearch('');
      setShowQuickCreateCustomer(false);
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    try {
      const response = await customerService.getCustomers();
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

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    const search = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.first_name.toLowerCase().includes(search) ||
        c.last_name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.phone.includes(search)
    );
  }, [customers, customerSearch]);

  // Filter plans based on search
  const filteredPlans = useMemo(() => {
    if (!planSearch) return plans;
    const search = planSearch.toLowerCase();
    return plans.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
    );
  }, [plans, planSearch]);

  const selectedCustomer = customers.find((c) => c.id === parseInt(formData.customer_id));
  const selectedPlan = plans.find((p) => p.id === parseInt(formData.plan_id));

  const handleQuickCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.first_name || !newCustomer.last_name || !newCustomer.email || !newCustomer.phone) {
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all customer fields',
      });
      return;
    }

    try {
      setQuickCreateLoading(true);
      const customerData: CreateCustomerData = {
        business: parseInt(businessId as string),
        first_name: newCustomer.first_name,
        last_name: newCustomer.last_name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        is_active: true,
      };
      
      const response = await customerService.createCustomer(customerData);
      await loadCustomers();
      setFormData((prev) => ({ ...prev, customer_id: response.customer.id.toString() }));
      setCustomerSearch(`${response.customer.first_name} ${response.customer.last_name}`);
      setShowQuickCreateCustomer(false);
      setNewCustomer({ first_name: '', last_name: '', email: '', phone: '' });
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Customer created successfully',
      });
    } catch (error: any) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create customer',
      });
    } finally {
      setQuickCreateLoading(false);
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

      const data: any = {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
      onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-6 rounded-t-xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Create New Subscription</h2>
            <p className="text-brand-100 mt-1">Set up a subscription plan for your customer</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      <form onSubmit={handleSubmit} className="space-y-6 p-8">
        {/* Info Banner */}
        {selectedPlan && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 -mt-2">
            <div className="flex items-start gap-3">
              <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Selected Plan: {selectedPlan.name}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-blue-700 dark:text-blue-300">
                  <span className="flex items-center gap-1">
                    <FiCheckCircle className="w-4 h-4" />
                    <strong>{selectedPlan.price} {selectedPlan.currency}</strong> / {selectedPlan.interval}
                  </span>
                  {selectedPlan.discounted_price && selectedPlan.discounted_price < selectedPlan.price && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <FiAlertCircle className="w-4 h-4" />
                      Discounted! Now <strong>{selectedPlan.discounted_price} {selectedPlan.currency}</strong>
                    </span>
                  )}
                  {selectedPlan.has_trial && (
                    <span className="flex items-center gap-1">
                      <FiCheckCircle className="w-4 h-4" />
                      {selectedPlan.trial_days} days free trial available
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
              Select Customer <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowQuickCreateCustomer(!showQuickCreateCustomer)}
              className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors"
            >
              <FiUserPlus className="w-4 h-4" />
              {showQuickCreateCustomer ? 'Hide Form' : 'Create New Customer'}
            </button>
          </div>

          {showQuickCreateCustomer ? (
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FiUserPlus className="w-4 h-4" />
                Quick Create Customer
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="First Name"
                  value={newCustomer.first_name}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, first_name: e.target.value }))}
                  required
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={newCustomer.last_name}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, last_name: e.target.value }))}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
                <Input
                  type="tel"
                  placeholder="Phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <Button
                type="button"
                onClick={handleQuickCreateCustomer}
                disabled={quickCreateLoading}
                className="w-full"
              >
                {quickCreateLoading ? 'Creating...' : 'Create Customer'}
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search customers by name, email, or phone..."
                  value={selectedCustomer ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}` : customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setFormData((prev) => ({ ...prev, customer_id: '' }));
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  required
                />
              </div>
              
              {showCustomerDropdown && !selectedCustomer && (
                <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, customer_id: customer.id.toString() }));
                          setCustomerSearch(`${customer.first_name} ${customer.last_name}`);
                          setShowCustomerDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {customer.first_name} {customer.last_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {customer.email} • {customer.phone}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <p className="text-sm">No customers found</p>
                      <p className="text-xs mt-1">Try a different search or create a new customer</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Plan Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
              Select Plan <span className="text-red-500">*</span>
            </label>
          </div>

          <div className="relative">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search plans by name or description..."
                value={selectedPlan ? selectedPlan.name : planSearch}
                onChange={(e) => {
                  setPlanSearch(e.target.value);
                  setFormData((prev) => ({ ...prev, plan_id: '' }));
                  setShowPlanDropdown(true);
                }}
                onFocus={() => setShowPlanDropdown(true)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                required
              />
            </div>
            
            {showPlanDropdown && !selectedPlan && (
              <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {filteredPlans.length > 0 ? (
                  filteredPlans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, plan_id: plan.id.toString() }));
                        setPlanSearch(plan.name);
                        setShowPlanDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{plan.name}</div>
                        <div className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                          {plan.discounted_price && plan.discounted_price < plan.price ? (
                            <>
                              <span className="line-through text-gray-400 mr-2">{plan.price}</span>
                              {plan.discounted_price} {plan.currency}
                            </>
                          ) : (
                            `${plan.price} ${plan.currency}`
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Billed {plan.interval} 
                        {plan.has_trial && ` • ${plan.trial_days} days trial`}
                        {plan.discounted_price && plan.discounted_price < plan.price && ' • Discounted'}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-sm">No plans found</p>
                    <p className="text-xs mt-1">Try a different search or create a new plan</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
            Start Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              required
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            The subscription will start on this date. Defaults to today.
          </p>
        </div>

        {/* Trial Option */}
        {selectedPlan?.has_trial && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="use_trial"
                checked={formData.use_trial}
                onChange={(e) => setFormData((prev) => ({ ...prev, use_trial: e.target.checked }))}
                className="mt-1 h-5 w-5 text-brand-600 focus:ring-brand-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="use_trial" className="flex-1 cursor-pointer">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  Start with free trial period
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Customer gets {selectedPlan.trial_days} days to try the service for free. 
                  Billing starts after the trial period ends.
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !formData.customer_id || !formData.plan_id}
          >
            {loading ? 'Creating...' : 'Create Subscription'}
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default CreateSubscriptionModal;
