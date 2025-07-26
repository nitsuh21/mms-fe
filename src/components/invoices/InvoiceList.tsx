import React from 'react';
import { Invoice } from '@/types/invoice';
import { FiDollarSign, FiList, FiX, FiTrash2 } from 'react-icons/fi';
import { useNotification } from '@/context/NotificationContext';
import { invoiceService } from '@/services/invoiceService';
import { useState, useEffect } from 'react';
import { PaymentList } from './PaymentList';
import BulkActions from '@/components/common/BulkActions';
import TableCheckbox from '@/components/common/TableCheckbox';

const statusColors = {
  P: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  C: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  O: { label: 'Overdue', color: 'bg-red-100 text-red-800' },
  PA: { label: 'Partially Paid', color: 'bg-blue-100 text-blue-800' },
} as const;

interface InvoiceListProps {
  invoices: Invoice[];
  onRefresh: () => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
}

export function InvoiceList({ invoices, onRefresh, onOpenPaymentModal }: InvoiceListProps) {
  const { addNotification } = useNotification();
  const [, setIsLoading] = useState(false);
  const [expandedInvoices, setExpandedInvoices] = useState<Set<number>>(new Set());
  const [invoicePayments, setInvoicePayments] = useState<{ [key: number]: number }>({});
  const [selectedInvoices, setSelectedInvoices] = useState<Set<number>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  useEffect(() => {
    const loadAllPayments = async () => {
      const payments: { [key: number]: number } = {};
      for (const invoice of invoices) {
        try {
          const invoicePayments = await invoiceService.getPayments(invoice.id);
          payments[invoice.id] = invoicePayments.reduce((sum, payment) => 
            sum + parseFloat(payment.amount.toString()), 0);
        } catch (err) {
          console.error(`Error loading payments for invoice ${invoice.id}:`, err);
          payments[invoice.id] = 0;
        }
      }
      setInvoicePayments(payments);
    };

    loadAllPayments();
  }, [invoices]);

  const handleDeleteInvoice = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        setIsLoading(true);
        await invoiceService.deleteInvoice(id);
        onRefresh();
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Invoice deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting invoice:', error);
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete invoice',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedInvoices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = invoices.map(invoice => invoice.id);
      setSelectedInvoices(new Set(allIds));
    } else {
      setSelectedInvoices(new Set());
    }
  };

  const handleSelectInvoice = (invoiceId: number, checked: boolean) => {
    const newSelected = new Set(selectedInvoices);
    if (checked) {
      newSelected.add(invoiceId);
    } else {
      newSelected.delete(invoiceId);
    }
    setSelectedInvoices(newSelected);
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      // Delete all selected invoices
      for (const invoiceId of selectedInvoices) {
        await invoiceService.deleteInvoice(invoiceId);
      }
      setSelectedInvoices(new Set());
      onRefresh();
      addNotification({
        type: 'success',
        title: 'Success',
        message: `${selectedInvoices.size} invoices deleted successfully`,
      });
    } catch (error) {
      console.error('Bulk delete failed:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete some invoices',
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedInvoices(new Set());
  };

  return (
    <div className="overflow-x-auto">
      {/* Bulk Actions */}
      <BulkActions
        selectedItems={Array.from(selectedInvoices).map(id => id.toString())}
        onDeleteSelected={handleBulkDelete}
        onClearSelection={handleClearSelection}
        itemName="invoices"
        isLoading={isBulkDeleting}
      />

      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              <TableCheckbox
                checked={invoices.length > 0 && selectedInvoices.size === invoices.length}
                onChange={handleSelectAll}
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Invoice #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Paid Amount
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
            <React.Fragment key={invoice.id}>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TableCheckbox
                    checked={selectedInvoices.has(invoice.id)}
                    onChange={(checked) => handleSelectInvoice(invoice.id, checked)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  #{invoice.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <div>{invoice.customer_name}</div>
                  <div className="text-xs text-gray-400">{invoice.customer_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  ${invoice.amount.toFixed(2)}
                  {invoice.remaining_balance > 0 && (
                    <span className="ml-2 text-sm text-gray-400">
                      ({invoice.remaining_balance.toFixed(2)} remaining)
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  ${(invoicePayments[invoice.id] || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status as keyof typeof statusColors]?.color || 'bg-gray-100 text-gray-800'}`}>
                    {statusColors[invoice.status as keyof typeof statusColors]?.label || invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {new Date(invoice.due_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => toggleExpand(invoice.id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View Payment History"
                  >
                    {expandedInvoices.has(invoice.id) ? (
                      <FiX className="h-4 w-4" />
                    ) : (
                      <FiList className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onOpenPaymentModal(invoice)}
                    className="ml-2 text-green-600 hover:text-green-900"
                    title="Add Payment"
                  >
                    <FiDollarSign className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteInvoice(invoice.id)}
                    className="ml-2 text-red-600 hover:text-red-900"
                    title="Delete Invoice"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
              {expandedInvoices.has(invoice.id) && (
                <tr>
                  <td colSpan={7} className="p-4">
                    <PaymentList 
                      invoiceId={invoice.id}
                      onPaymentUpdate={() => {
                        // Refresh payments for this invoice
                        const loadInvoicePayments = async () => {
                          try {
                            const payments = await invoiceService.getPayments(invoice.id);
                            setInvoicePayments(prev => ({
                              ...prev,
                              [invoice.id]: payments.reduce((sum, payment) => 
                                sum + parseFloat(payment.amount.toString()), 0)
                            }));
                          } catch (err) {
                            console.error(`Error reloading payments for invoice ${invoice.id}:`, err);
                          }
                        };
                        loadInvoicePayments();
                      }} 
                    />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
