import { Invoice } from '@/types/invoice';
import { CreatePaymentData, PaymentType } from '@/types/payment';

import { useNotification } from '@/context/NotificationContext';
import { invoiceService } from '@/services/invoiceService';
import { useState } from 'react';

const paymentTypes = [
  { value: 'base', label: 'Regular Payment' },
  { value: 'extra', label: 'Extra Payment' },
  { value: 'penalty', label: 'Penalty Payment' },
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
  const [errors, setErrors] = useState<Partial<Record<keyof CreatePaymentData, string>>>({});
  // Initialize payment data with amount as 0
  const [paymentData, setPaymentData] = useState<CreatePaymentData>({
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
        invoice: invoice.id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        payment_type: paymentData.payment_type,
        reason: paymentData.reason || '',
        reference_number: paymentData.reference_number || ''
      });

      // Update invoice status
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
        payment_type: 'base' as PaymentType,
        reason: paymentData.reason || '',
        reference_number: paymentData.reference_number || '',
      });
      setErrors({});
    } catch (err: any) {
      console.error('Error creating payment:', err);
      let errorMessage = 'Failed to process payment';
      
      if (err.response?.data) {
        // Handle validation errors
        if (err.response.data.amount) {
          errorMessage = err.response.data.amount[0];
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors[0];
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      addNotification({
        type: 'error',
        title: 'Payment Error',
        message: errorMessage,
      });

      // Set field-specific errors if they exist
      if (err.response?.data) {
        const newErrors: Record<string, string> = {};
        Object.entries(err.response.data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            newErrors[key] = value[0];
          } else if (typeof value === 'string') {
            newErrors[key] = value;
          }
        });
        setErrors(newErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
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
              onChange={handleInputChange}
              name="payment_method"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="CA">Cash</option>
              <option value="TB">TeleBirr</option>
              <option value="CBE">CBE</option>
              <option value="BOA">Bank of Abyssinia</option>
              <option value="AW">Awash</option>
              <option value="OT">Others</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Type <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentData.payment_type}
              onChange={handleInputChange}
              name="payment_type"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
            >
              {paymentTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reason/Notes
            </label>
            <textarea
              name="reason"
              value={paymentData.reason}
              onChange={handleInputChange}
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
