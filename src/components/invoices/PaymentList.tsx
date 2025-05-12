import { useState, useEffect } from 'react';
import { invoiceService } from '@/services/invoiceService';
import { Payment } from '@/types/invoice';
import { FiDollarSign, FiTrash2 } from 'react-icons/fi';
import { useNotification } from '@/context/NotificationContext';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';

interface PaymentListProps {
  invoiceId: number;
  onPaymentUpdate?: () => void;
}

export function PaymentList({ invoiceId, onPaymentUpdate }: PaymentListProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const { addNotification } = useNotification();

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const response = await invoiceService.getPayments(invoiceId);
      setPayments(response || []);
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [invoiceId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        No payments found
      </div>
    );
  }

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'base':
        return 'Base Payment';
      case 'penalty':
        return 'Penalty';
      case 'extra':
        return 'Extra';
      case 'other':
        return 'Other';
      default:
        return type;
    }
  };

  return (
    <>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Method
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Reason
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Reference
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                {new Date(payment.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                {getPaymentTypeLabel(payment.payment_type)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                ${parseFloat(payment.amount.toString()).toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                {payment.payment_method}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                {payment.reason}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                {payment.reference_number || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                <button
                  onClick={() => setPaymentToDelete(payment)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete Payment"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <DeleteConfirmationModal
      isOpen={paymentToDelete !== null}
      onClose={() => setPaymentToDelete(null)}
      onConfirm={async () => {
        if (!paymentToDelete) return;
        try {
          setIsDeletingPayment(true);
          await invoiceService.deletePayment(paymentToDelete.id);
          addNotification({
            type: 'success',
            title: 'Success',
            message: 'Payment deleted successfully'
          });
          await loadPayments();
          if (onPaymentUpdate) {
            onPaymentUpdate();
          }
        } catch (error: any) {
          addNotification({
            type: 'error',
            title: 'Error',
            message: error.message || 'Failed to delete payment'
          });
        } finally {
          setIsDeletingPayment(false);
          setPaymentToDelete(null);
        }
      }}
      title="Delete Payment"
      message={`Are you sure you want to delete this payment of $${Number(paymentToDelete?.amount || 0).toFixed(2)}? This action cannot be undone.`}
      isDeleting={isDeletingPayment}
    />
    </>
  );
}
