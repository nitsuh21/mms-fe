import { Invoice, CreatePaymentData, PaymentType } from '@/types/invoice';
import { FiCalendar, FiCreditCard } from 'react-icons/fi';
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

interface AdvancePaymentModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function AdvancePaymentModal({ invoice, isOpen, onClose, onRefresh }: AdvancePaymentModalProps) {
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [months, setMonths] = useState(1);
  const [paymentData, setPaymentData] = useState<CreatePaymentData>({
    invoice: 0,
    amount: 0,
    payment_method: 'CA',
    payment_type: 'SUB',
    description: 'Advance payment for future periods',
    reference_number: '',
  });

  // Calculate the end date based on current subscription end date + selected months
  const calculateNewEndDate = () => {
    if (!invoice?.subscription) return 'N/A';
    
    const currentEndDate = new Date(invoice.subscription.end_date || new Date());
    const newEndDate = new Date(currentEndDate);
    newEndDate.setMonth(newEndDate.getMonth() + months);
    
    return newEndDate.toLocaleDateString();
  };

  // Calculate the total amount based on monthly subscription price and selected months
  const calculateTotalAmount = () => {
    if (!invoice?.subscription?.plan?.price) return 0;
    return invoice.subscription.plan.price * months;
  };

  const handleCreateAdvancePayment = async () => {
    if (!invoice) return;

    try {
      setIsLoading(true);
      
      // First, make the payment for the current invoice if it's not fully paid
      if (invoice.remaining_balance > 0) {
        await invoiceService.createPayment({
          invoice: invoice.id,
          amount: invoice.remaining_balance,
          payment_method: paymentData.payment_method,
          payment_type: 'SUB',
          description: 'Current period payment',
          reference_number: paymentData.reference_number,
        });
      }
      
      // Then, call the extend subscription endpoint with the number of months
      const response = await invoiceService.extendSubscription(
        invoice.subscription.id, 
        months, 
        paymentData.payment_method,
        paymentData.reference_number
      );

      onRefresh();

      addNotification({
        type: 'success',
        title: 'Success',
        message: `Subscription extended by ${months} month${months > 1 ? 's' : ''} successfully`,
      });

      onClose();
      setMonths(1);
      setPaymentData({
        invoice: 0,
        amount: 0,
        payment_method: 'CA',
        payment_type: 'SUB',
        description: 'Advance payment for future periods',
        reference_number: '',
      });
    } catch (err) {
      console.error('Error creating advance payment:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to extend subscription',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !invoice) return null;

  const totalAmount = calculateTotalAmount();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Advance Payment for Future Periods
        </h2>
        
        <div className="mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 dark:text-white">Subscription Details</h3>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <p>Customer: {invoice.subscription?.customer?.first_name} {invoice.subscription?.customer?.last_name}</p>
              <p>Plan: {invoice.subscription?.plan?.name}</p>
              <p>Current End Date: {new Date(invoice.subscription?.end_date || new Date()).toLocaleDateString()}</p>
              <p>Monthly Price: ${invoice.subscription?.plan?.price?.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          handleCreateAdvancePayment();
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Number of Months to Extend <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                min="1"
                max="36"
                value={months}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1 && value <= 36) {
                    setMonths(value);
                  }
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                required
              />
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                New End Date: {calculateNewEndDate()}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Amount
            </label>
            <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
              <span className="text-lg font-medium">${totalAmount.toFixed(2)}</span>
              {invoice.remaining_balance > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Includes current balance: ${invoice.remaining_balance.toFixed(2)}
                </div>
              )}
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
              disabled={isLoading || months < 1}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-md hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Make Advance Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
