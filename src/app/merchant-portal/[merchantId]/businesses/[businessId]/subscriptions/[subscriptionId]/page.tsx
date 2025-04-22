'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Subscription, subscriptionService } from '@/services/subscriptionService';
import { Invoice } from '@/types/invoice';
import { useNotification } from '@/context/NotificationContext';
import { FiDollarSign } from 'react-icons/fi';
import { PaymentModal } from '@/components/invoices/PaymentModal';

export default function SubscriptionDetailsPage() {
  const params = useParams() as { businessId: string; merchantId: string; subscriptionId: string };
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadSubscriptionDetails();
  }, [params.subscriptionId]);

  const loadSubscriptionDetails = async () => {
    try {
      setIsLoading(true);
      const subscriptionData = await subscriptionService.getSubscription(parseInt(params.subscriptionId));
      setSubscription(subscriptionData);
      
      // Load invoices for this subscription
      const invoicesData = await subscriptionService.getSubscriptionInvoices(parseInt(params.subscriptionId));
      setInvoices(invoicesData);
    } catch (err) {
      console.error('Error loading subscription details:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load subscription details',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Subscription not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-semibold mb-4">Subscription Details</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Customer</p>
            <p className="font-medium">{subscription.customer.first_name} {subscription.customer.last_name}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Plan</p>
            <p className="font-medium">{subscription.plan.name}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Status</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              subscription.status === 'AC' ? 'bg-green-100 text-green-800' :
              subscription.status === 'TR' ? 'bg-blue-100 text-blue-800' :
              subscription.status === 'PD' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {subscription.status === 'AC' ? 'Active' :
               subscription.status === 'TR' ? 'Trial' :
               subscription.status === 'PD' ? 'Past Due' :
               'Cancelled'}
            </span>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Start Date</p>
            <p className="font-medium">{new Date(subscription.start_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">End Date</p>
            <p className="font-medium">{subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A'}</p>
          </div>
          {subscription.trial_end && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">Trial End Date</p>
              <p className="font-medium">{new Date(subscription.trial_end).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Invoices & Payment History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{invoice.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    ${invoice.amount.toFixed(2)}
                    {invoice.remaining_balance > 0 && (
                      <span className="ml-2 text-sm text-gray-400">
                        ({invoice.remaining_balance.toFixed(2)} remaining)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invoice.status === 'P' ? 'bg-yellow-100 text-yellow-800' :
                      invoice.status === 'C' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'O' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {invoice.status === 'P' ? 'Pending' :
                       invoice.status === 'C' ? 'Completed' :
                       invoice.status === 'O' ? 'Overdue' :
                       'Partially Paid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleOpenPaymentModal(invoice)}
                      className="text-brand-600 hover:text-brand-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={invoice.status === 'C'}
                      title={invoice.status === 'C' ? 'Invoice is already paid' : 'Add Payment'}
                    >
                      <FiDollarSign className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentModal
        invoice={selectedInvoice}
        isOpen={showPaymentModal}
        onClose={() => {
          setSelectedInvoice(null);
          setShowPaymentModal(false);
        }}
        onRefresh={loadSubscriptionDetails}
      />
    </div>
  );
}
