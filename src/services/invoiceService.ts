import api from './api';
import { Invoice, CreateInvoiceData, UpdateInvoiceData } from '@/types/invoice';
import { Payment, CreatePaymentData, UpdatePaymentData } from '@/types/payment';

// Helper function to convert numeric fields
const convertInvoice = (invoice: any): Invoice => ({
  ...invoice,
  amount: typeof invoice.amount === 'number' ? invoice.amount : parseFloat(invoice.amount || '0'),
  total_paid: typeof invoice.total_paid === 'number' ? invoice.total_paid : parseFloat(invoice.total_paid || '0'),
  remaining_balance: typeof invoice.remaining_balance === 'number' ? invoice.remaining_balance : parseFloat(invoice.remaining_balance || '0'),
});

export const invoiceService = {
  async getInvoices(businessId: string): Promise<Invoice[]> {
    try {
      const response = await api.get(`/subscriptions/invoices/`);
      const invoices = response.data.results || [];
      return invoices.map(convertInvoice);
    } catch (error) {
      console.error('Error fetching invoices:', error);
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
      const response = await api.post(`/subscriptions/invoices/${data.invoice}/payments/create/`, data);
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
      const response = await api.get(`/subscriptions/invoices/payments/${paymentId}/`);
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
      const response = await api.patch(`/subscriptions/invoices/payments/${paymentId}/`, data);
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
