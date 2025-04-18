import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX } from 'react-icons/fi';
import { useNotification } from '@/context/NotificationContext';
import { invoiceService } from '@/services/invoiceService';
import { subscriptionService, Subscription as ApiSubscription } from '@/services/subscriptionService';
import { CreateInvoiceData } from '@/types/invoice';

interface CreateInvoiceModalProps {
  businessId: string;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function CreateInvoiceModal({
  businessId,
  isOpen,
  onClose,
  onRefresh
}: CreateInvoiceModalProps) {
  const [subscriptions, setSubscriptions] = useState<ApiSubscription[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateInvoiceData>>({
    payment_method: 'MT',
    due_date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        setIsLoadingSubscriptions(true);
        const response = await subscriptionService.getSubscriptions(businessId);
        console.log("Subscriptions:", response)
        setSubscriptions(response.filter(sub => sub.status === 'AC' || sub.status === 'TR'));
      } catch (error) {
        console.error('Error loading subscriptions:', error);
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load subscriptions'
        });
      } finally {
        setIsLoadingSubscriptions(false);
      }
    };

    if (isOpen) {
      loadSubscriptions();
    }
  }, [businessId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      await invoiceService.createInvoice(formData);
      
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Invoice created successfully'
      });
      
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error creating invoice:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create invoice'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-medium">
              Create New Invoice
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="subscription" className="block text-sm font-medium text-gray-700">
                  Subscription
                </label>
                <select
                  id="subscription"
                  name="subscription"
                  value={formData.subscription}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                  required
                >
                  <option value="">Select Subscription</option>
                  {isLoadingSubscriptions ? (
                    <option disabled>Loading subscriptions...</option>
                  ) : (
                    subscriptions.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.customer.first_name} {sub.customer.last_name} - {sub.plan.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>
              
              <div>
                <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <select
                  id="payment_method"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                  required
                >
                  <option value="MT">Manual Transfer</option>
                  <option value="CA">Cash</option>
                  <option value="TB">Telebirr</option>
                  <option value="CB">CBE</option>
                  <option value="CP">Coop</option>
                  <option value="AG">Payment Aggregator</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md border border-transparent bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                {isSubmitting ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 