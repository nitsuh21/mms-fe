import api from './api';
import { Invoice, CreateInvoiceData, UpdateInvoiceData, Payment, CreatePaymentData, UpdatePaymentData } from '@/types/invoice';
import { createErrorHandler } from '@/utils/errorHandling';

// Create error handler for invoice service
const handleError = createErrorHandler('InvoiceService');

// Helper function to convert numeric fields
const convertInvoice = (invoice: Record<string, unknown>): Invoice => {
  // Ensure all required fields are present with proper types
  return {
    id: typeof invoice.id === 'number' ? invoice.id : Number(invoice.id),
    invoice_number: String(invoice.invoice_number || ''),
    subscription: invoice.subscription as Invoice['subscription'],
    customer_name: String(invoice.customer_name || ''),
    customer_email: String(invoice.customer_email || ''),
    amount: typeof invoice.amount === 'number' ? invoice.amount : parseFloat(String(invoice.amount) || '0'),
    payment_method: String(invoice.payment_method || 'OT') as Invoice['payment_method'],
    status: String(invoice.status || 'O') as Invoice['status'],
    due_date: String(invoice.due_date || ''),
    paid_date: invoice.paid_date ? String(invoice.paid_date) : undefined,
    reference_number: invoice.reference_number ? String(invoice.reference_number) : undefined,
    currency: String(invoice.currency || 'ETB'),
    total_paid: typeof invoice.total_paid === 'number' ? invoice.total_paid : parseFloat(String(invoice.total_paid) || '0'),
    remaining_balance: typeof invoice.remaining_balance === 'number' ? invoice.remaining_balance : parseFloat(String(invoice.remaining_balance) || '0'),
    created_at: String(invoice.created_at || ''),
    updated_at: String(invoice.updated_at || ''),
    payments: Array.isArray(invoice.payments) ? invoice.payments as Payment[] : undefined
  };
};

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    try {
      const response = await api.get(`/subscriptions/invoices/`);
      const invoices = response.data.results || [];
      return invoices.map(convertInvoice);
    } catch (error: unknown) {
      return handleError(error, 'fetch invoices');
    }
  },

  async getSubscriptionInvoices(subscriptionId: number): Promise<Invoice[]> {
    try {
      const response = await api.get(`/subscriptions/subscriptions/${subscriptionId}/invoices/`);
      const invoices = response.data.results || [];
      return invoices.map(convertInvoice);
    } catch (error) {
      console.error('Error fetching subscription invoices:', error);
      throw error;
    }
  },

  async getInvoice(id: number): Promise<Invoice> {
    try {
      const response = await api.get(`/subscriptions/invoices/${id}/`);
      return convertInvoice(response.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  },

  async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    try {
      const response = await api.post(`/subscriptions/invoices/`, data);
      return convertInvoice(response.data);
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  async updateInvoice(id: number, data: UpdateInvoiceData): Promise<Invoice> {
    try {
      const response = await api.patch(`/subscriptions/invoices/${id}/`, data);
      return convertInvoice(response.data);
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  },

  async deleteInvoice(id: number): Promise<void> {
    try {
      await api.delete(`/subscriptions/invoices/${id}/`);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  },

  async generateInvoicePdf(invoiceId: string): Promise<Blob> {
    try {
      const response = await api.get(`/subscriptions/invoices/${invoiceId}/pdf/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw error;
    }
  },

  /**
   * Create a new payment for an invoice
   */
  async createPayment(data: CreatePaymentData): Promise<Payment> {
    try {
      console.log('Creating payment:', data);
      const response = await api.post(`/subscriptions/invoices/${data.invoice}/payments/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  /**
   * Get all payments for an invoice
   */
  async getPayments(invoiceId: number): Promise<Payment[]> {
    try {
      const response = await api.get(`/subscriptions/invoices/${invoiceId}/payments/`);
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  /**
   * Get payment details
   */
  async getPayment(paymentId: number): Promise<Payment> {
    try {
      const response = await api.get(`/subscriptions/payments/${paymentId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  },

  /**
   * Update payment details
   */
  async updatePayment(paymentId: number, data: UpdatePaymentData): Promise<Payment> {
    try {
      const response = await api.patch(`/subscriptions/payments/${paymentId}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  },

  /**
   * Delete a payment
   */
  async deletePayment(paymentId: number): Promise<void> {
    try {
      await api.delete(`/subscriptions/invoices/payments/${paymentId}/`);
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  },
};
