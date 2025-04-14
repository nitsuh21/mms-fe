import { Invoice, CreatePaymentData } from '@/types/invoice';
import { FiDollarSign, FiCreditCard } from 'react-icons/fi';
import { useNotification } from '@/context/NotificationContext';
import { invoiceService } from '@/services/invoiceService';
import { useState } from 'react';

const paymentMethods = [
  { value: 'CA', label: 'Cash' },
  { value: 'TB', label: 'Telebirr' },
  { value: 'CB', label: 'CBE' },
  { value: 'CP', label: 'Coop' },
  { value: 'AG', label: 'Payment Aggregator' },
] as const;

interface PaymentModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function PaymentModal({ invoice, isOpen, onClose, onRefresh }: PaymentModalProps) {
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<CreatePaymentData>({
    invoice: 0,
    amount: 0,
    payment_method: 'CA',
    reference_number: '',
  });

  const handleCreatePayment = async () => {
    if (!invoice) return;

    try {
      setIsLoading(true);
      const response = await invoiceService.createPayment({
        invoice: invoice.id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        reference_number: paymentData.reference_number,
      });

      // Update invoice status
      const updatedInvoice = await invoiceService.getInvoice(invoice.id);
      onRefresh();

      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Payment created successfully',
      });

      onClose();
      setPaymentData({
        invoice: 0,
        amount: 0,
        payment_method: 'CA',
        reference_number: '',
      });
    } catch (err) {
      console.error('Error creating payment:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to create payment',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Make Payment for Invoice #{invoice.id}
        </h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleCreatePayment();
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                max={invoice.remaining_balance}
                value={paymentData.amount}
                onChange={(e) => {
                  const amount = parseFloat(e.target.value);
                  if (!isNaN(amount) && amount <= invoice.remaining_balance) {
                    setPaymentData({ ...paymentData, amount });
                  }
                }}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                required
              />
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Maximum: ${invoice.remaining_balance.toFixed(2)}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentData.payment_method}
              onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value as CreatePaymentData['payment_method'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              required
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reference Number
            </label>
            <input
              type="text"
              value={paymentData.reference_number}
              onChange={(e) => setPaymentData({ ...paymentData, reference_number: e.target.value })}
              placeholder="Optional reference number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
            />
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || paymentData.amount <= 0}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-md hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Make Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
