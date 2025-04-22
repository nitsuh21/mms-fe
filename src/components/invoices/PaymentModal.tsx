import { Invoice, CreatePaymentData } from '@/types/invoice';

type PaymentFormData = {
  invoice: number;
  amount: number;
  payment_method: 'CA' | 'TB' | 'CB' | 'CP' | 'AG';
  payment_type: 'base' | 'penalty' | 'extra' | 'other';
  reason: string;
  reference_number: string;
};
import { FiDollarSign, FiCreditCard } from 'react-icons/fi';
import { useNotification } from '@/context/NotificationContext';
import { invoiceService } from '@/services/invoiceService';
import { useState } from 'react';
import { PaymentList } from '@/components/invoices/PaymentList';

const paymentMethods = [
  { value: 'CA', label: 'Cash' },
  { value: 'TB', label: 'Telebirr' },
  { value: 'CB', label: 'CBE' },
  { value: 'CP', label: 'Coop' },
  { value: 'AG', label: 'Payment Aggregator' },
] as const;

const paymentTypes = [
  { value: 'base', label: 'Base Payment' },
  { value: 'penalty', label: 'Penalty' },
  { value: 'extra', label: 'Extra' },
  { value: 'other', label: 'Other' },
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
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentFormData, string>>>({});
  // Initialize payment data with amount as 0
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    invoice: 0,
    amount: 0,
    payment_method: 'CA',
    payment_type: 'base',
    reason: '',
    reference_number: '',
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (paymentData.amount === undefined || paymentData.amount === null) {
      newErrors.amount = 'Amount is required';
    } else if (paymentData.amount < 0) {
      newErrors.amount = 'Amount cannot be negative';
    } else if (paymentData.amount === 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    // No remaining balance validation

    // Reason is optional

    if (paymentData.payment_method === 'TB' && !paymentData.reference_number) {
      newErrors.reference_number = 'Reference number is required for Telebirr payments';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreatePayment = async () => {
    if (!invoice) return;

    if (!validateForm()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await invoiceService.createPayment({
        ...paymentData,
        invoice: invoice.id,
      });

      // Update invoice status
      const updatedInvoice = await invoiceService.getInvoice(invoice.id);
      onRefresh();

      addNotification({
        type: 'success',
        title: 'Success',
        message: `Payment of $${paymentData.amount.toFixed(2)} processed successfully`,
      });

      onClose();
      setPaymentData({
        invoice: 0,
        amount: 0,
        payment_method: 'CA',
        payment_type: 'base',
        reason: '',
        reference_number: '',
      });
      setErrors({});
    } catch (err) {
      console.error('Error creating payment:', err);
      let errorMessage = 'Failed to process payment';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as any).response;
        if (response?.data?.detail) {
          errorMessage = response.data.detail;
        } else if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      }

      addNotification({
        type: 'error',
        title: 'Payment Error',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center overflow-y-auto py-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-3xl mx-4 shadow-xl">
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Make Payment for Invoice #{invoice.id}
        </h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleCreatePayment();
        }} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input
                type="number"
                step="0.01"
                min="0"

                value={paymentData.amount || ''}
                onChange={(e) => {
                  const amount = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  if (!isNaN(amount)) {
                    setPaymentData({ ...paymentData, amount });
                    setErrors((prev) => {
                      const { amount, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                className={`block w-full rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 ${errors.amount ? 'border-red-300' : 'border-gray-300'}`}
  
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
              )}

            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentData.payment_method}
              onChange={(e) => {
                const method = e.target.value as CreatePaymentData['payment_method'];
                setPaymentData(prev => ({
                  ...prev,
                  payment_method: method,
                  // Clear reference number when switching away from Telebirr
                  reference_number: method === 'TB' ? prev.reference_number : ''
                }));
                setErrors(prev => {
                  const { reference_number, ...rest } = prev;
                  return rest;
                });
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
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
              Payment Type <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentData.payment_type}
              onChange={(e) => {
                const payment_type = e.target.value as CreatePaymentData['payment_type'];
                setPaymentData({ ...paymentData, payment_type });
                setErrors(prev => {
                  const { payment_type, ...rest } = prev;
                  return rest;
                });
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
            >
              {paymentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={paymentData.reason}
              onChange={(e) => {
                setPaymentData({ ...paymentData, reason: e.target.value });
                setErrors(prev => {
                  const { reason, ...rest } = prev;
                  return rest;
                });
              }}
              placeholder="Enter reason for payment"
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 ${errors.reason ? 'border-red-300' : 'border-gray-300'}`}
              rows={3}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reason}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reference Number {paymentData.payment_method === 'TB' && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={paymentData.reference_number}
              onChange={(e) => {
                setPaymentData({ ...paymentData, reference_number: e.target.value });
                setErrors(prev => ({ ...prev, reference_number: undefined }));
              }}
              placeholder={paymentData.payment_method === 'TB' ? 'Enter Telebirr transaction ID' : 'Optional reference number'}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 ${errors.reference_number ? 'border-red-300' : 'border-gray-300'}`}
              required={paymentData.payment_method === 'TB'}
            />
            {errors.reference_number && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reference_number}</p>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-3 col-span-1 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !paymentData.amount || paymentData.amount <= 0}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-md hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? 'Processing...' : 'Make Payment'}
            </button>
          </div>
        </form>


      </div>
    </div>
  );
}
