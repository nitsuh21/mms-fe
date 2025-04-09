import { Payment } from '@/types/invoice';
import { FiDollarSign, FiCreditCard, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import { useNotification } from '@/context/NotificationContext';
import { invoiceService } from '@/services/invoiceService';
import { useState, useEffect } from 'react';

const paymentStatusColors = {
  P: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  C: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  F: { label: 'Failed', color: 'bg-red-100 text-red-800' },
  R: { label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
} as const;

interface PaymentsListProps {
  invoiceId: number;
  onRefresh: () => void;
}

export function PaymentsList({ invoiceId, onRefresh }: PaymentsListProps) {
  const { addNotification } = useNotification();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, [invoiceId]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const response = await invoiceService.getPayments(invoiceId);
      setPayments(response || []);
      setError(null);
    } catch (err) {
      console.error('Error loading payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payments');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load payments. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        setIsLoading(true);
        await invoiceService.deletePayment(paymentId);
        await loadPayments();
        onRefresh();
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Payment deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting payment:', error);
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete payment',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mx-auto"></div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        No payments made yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Payment History
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    ${Number(payment.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {payment.payment_method}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[payment.status as keyof typeof paymentStatusColors]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {paymentStatusColors[payment.status as keyof typeof paymentStatusColors]?.label || payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {payment.reference_number || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    {payment.status === 'P' && (
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Payment"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
