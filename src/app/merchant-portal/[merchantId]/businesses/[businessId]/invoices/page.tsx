'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import { Invoice } from '@/types/invoice';
import { invoiceService } from '@/services/invoiceService';
import { FiRefreshCw, FiPlus, FiDollarSign, FiCreditCard } from 'react-icons/fi';
import { InvoiceList } from '@/components/invoices/InvoiceList';
import { PaymentModal } from '@/components/invoices/PaymentModal';

export default function InvoicesPage() {
  const params = useParams() as { businessId: string; merchantId: string };
  const businessId = params.businessId;
  const merchantId = params.merchantId;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification();

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await invoiceService.getInvoices(businessId);
      setInvoices(response || []);
      setError(null);
    } catch (err) {
      console.error('Error loading invoices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load invoices. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadInvoices();
  };

  const handleCreateInvoice = async () => {
    // TODO: Implement invoice creation
  };

  const handleOpenPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  useEffect(() => {
    loadInvoices();
  }, [businessId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded-lg border border-transparent bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            <FiRefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleCreateInvoice}
            className="flex items-center gap-2 rounded-lg border border-transparent bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <FiPlus className="h-4 w-4" />
            New Invoice
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <InvoiceList
          invoices={invoices}
          onRefresh={handleRefresh}
          onOpenPaymentModal={handleOpenPaymentModal}
        />
      </div>

      <PaymentModal
        invoice={selectedInvoice}
        isOpen={showPaymentModal}
        onClose={() => {
          setSelectedInvoice(null);
          setShowPaymentModal(false);
        }}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
