import api from './api';
import { Payment, CreatePaymentData, UpdatePaymentData } from '@/types/payment';

export const paymentService = {
  async createPayment(paymentData: CreatePaymentData) {
    const response = await api.post('/subscriptions/payments/', paymentData);
    return response.data;
  },

  async getPaymentsForInvoice(invoiceId: number) {
    const response = await api.get(`/subscriptions/invoices/${invoiceId}/payments/`);
    return response.data;
  },

  async getPayment(paymentId: number) {
    const response = await api.get(`/subscriptions/payments/${paymentId}/`);
    return response.data;
  },

  async updatePayment(paymentId: number, paymentData: UpdatePaymentData) {
    const response = await api.put(`/subscriptions/payments/${paymentId}/`, paymentData);
    return response.data;
  },
  
  async deletePayment(paymentId: number) {
    const response = await api.delete(`/subscriptions/payments/${paymentId}/`);
    return response.data;
  }
}; 