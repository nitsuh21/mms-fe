import { useState, useEffect } from 'react';
import { Invoice } from '@/types/invoice';
import { invoiceService } from '@/services';
import { formatDate } from '@/utils/dateUtils';
import { FiX, FiDownload, FiCreditCard } from 'react-icons/fi';
import { Dialog } from '@headlessui/react';
import { PaymentsList } from './PaymentsList';

interface InvoiceDetailsProps {
  invoiceId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
  onRefresh: () => void;
}

export function InvoiceDetails({ 
  invoiceId, 
  isOpen, 
  onClose, 
  onOpenPaymentModal,
  onRefresh
}: InvoiceDetailsProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && invoiceId) {
      loadInvoice();
    }
  }, [isOpen, invoiceId]);

  const loadInvoice = async () => {
    if (!invoiceId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await invoiceService.getInvoice(invoiceId);
      setInvoice(data);
    } catch (error) {
      console.error('Error loading invoice details:', error);
      setError('Failed to load invoice details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!invoice) return;
    
    try {
      const pdfBlob = await invoiceService.generateInvoicePdf(invoice.id.toString());
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${invoice.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'C':
        return 'bg-green-100 text-green-800';
      case 'P':
        return 'bg-yellow-100 text-yellow-800';
      case 'O':
        return 'bg-red-100 text-red-800';
      case 'PA':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'C':
        return 'Completed';
      case 'P':
        return 'Pending';
      case 'O':
        return 'Overdue';
      case 'PA':
        return 'Partially Paid';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'MT':
        return 'Manual Transfer';
      case 'CA':
        return 'Cash';
      case 'TB':
        return 'Telebirr';
      case 'CB':
        return 'CBE';
      case 'CP':
        return 'Coop';
      case 'AG':
        return 'Payment Aggregator';
      default:
        return method;
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-medium">
              Invoice Details
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : invoice ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-2">Invoice Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Invoice #:</span> {invoice.id}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span>{' '}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Created:</span> {formatDate(invoice.created_at)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Due Date:</span> {formatDate(invoice.due_date)}
                    </p>
                    {invoice.paid_date && (
                      <p className="text-sm">
                        <span className="font-medium">Paid Date:</span> {formatDate(invoice.paid_date)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-2">Payment Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Total Amount:</span> {invoice.amount} {invoice.currency || 'ETB'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Paid Amount:</span> {invoice.total_paid} {invoice.currency || 'ETB'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Remaining Balance:</span> {invoice.remaining_balance} {invoice.currency || 'ETB'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Payment Method:</span> {getPaymentMethodText(invoice.payment_method)}
                    </p>
                    {invoice.reference_number && (
                      <p className="text-sm">
                        <span className="font-medium">Reference Number:</span> {invoice.reference_number}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mb-6">
                <h3 className="text-md font-medium">Payment History</h3>
                <div className="flex space-x-2">
                  {(invoice.status === 'P' || invoice.status === 'PA' || invoice.status === 'O') && (
                    <button
                      onClick={() => onOpenPaymentModal(invoice)}
                      className="flex items-center text-sm text-white bg-brand-600 hover:bg-brand-700 px-3 py-1 rounded"
                    >
                      <FiCreditCard className="h-4 w-4 mr-1" />
                      Record Payment
                    </button>
                  )}
                  <button
                    onClick={handleDownloadInvoice}
                    className="flex items-center text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                  >
                    <FiDownload className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
              
              <PaymentsList invoiceId={invoice.id} onRefresh={onRefresh} />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No invoice data available</div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 