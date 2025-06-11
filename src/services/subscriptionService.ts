import api from "./api";
import { Invoice } from '@/types/invoice';
import { createErrorHandler } from '@/utils/errorHandling';

// Create error handler for subscription service
const handleError = createErrorHandler('SubscriptionService');

export interface Subscription {
  id: string;
  business: number;
  plan: {
    id: number;
    business: number;
    name: string;
    description: string;
    price: string;
    currency: string;
    interval: 'D' | 'W' | 'M' | 'Y';
    trial_days: number;
    has_trial: boolean;
    features: Record<string, string>;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  customer: {
    id: number;
    user: number | null;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  status: 'AC' | 'PD' | 'CN' | 'TR' | 'EX' | 'PN';
  start_date: string;
  end_date: string;
  trial_end: string | null;
  next_billing_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionData {
  business: number;
  plan_id: number;
  customer_id: number;
  start_date: string;
  end_date?: string;
  status?: 'AC' | 'PD' | 'CN' | 'TR' | 'EX' | 'PN';
  trial_end?: string;
  next_billing_date: string;
  use_trial?: boolean;
}

export interface UpdateSubscriptionData {
  status?: 'AC' | 'PD' | 'CN' | 'TR' | 'EX' | 'PN';
  start_date?: string;
  end_date?: string;
  trial_end?: string;
}

export interface Payment {
  id: number;
  created_at: string;
  amount: string;
  status: 'C' | 'P' | 'F'; // Completed, Pending, Failed
}

export interface InvoiceData {
  id: number;
  invoice_number: string;
  subscription: Subscription;
  customer_name: string;
  customer_email: string;
  payment_method: string;
  status: string;
  due_date: string;
  amount: number;
  remaining_balance: number;
  total_paid: number;
  created_at: string;
  updated_at: string;
}

export class SubscriptionService {
  // Get all subscriptions for a business
  async getSubscriptions(businessId: string): Promise<Subscription[]> {
    if (!businessId) {
      throw new Error('Business ID is required');
    }

    try {
      const response = await api.get(`/subscriptions/subscriptions/?business=${businessId}`);
      return response.data.results || [];
    } catch (error: unknown) {
      return handleError(error, 'fetch subscriptions');
    }
  }

  // Get a specific subscription
  async getSubscription(subscriptionId: number): Promise<Subscription> {
    try {
      const response = await api.get(`/subscriptions/subscriptions/${subscriptionId}/`);
      return response.data;
    } catch (error: unknown) {
      return handleError(error, 'fetch subscription details');
    }
  }

  // Create a new subscription
  async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
    // Validate required fields
    if (!data.business || !data.plan_id || !data.customer_id || !data.start_date) {
      throw new Error('Missing required fields');
    }

    // Validate dates
    const startDate = new Date(data.start_date);
    if (isNaN(startDate.getTime())) {
      throw new Error('Invalid start date format');
    }

    if (data.end_date) {
      const endDate = new Date(data.end_date);
      if (isNaN(endDate.getTime())) {
        throw new Error('Invalid end date format');
      }
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
    }

    if (data.trial_end) {
      const trialEndDate = new Date(data.trial_end);
      if (isNaN(trialEndDate.getTime())) {
        throw new Error('Invalid trial end date format');
      }
      if (trialEndDate <= startDate) {
        throw new Error('Trial end date must be after start date');
      }
    }

    try {
      const response = await api.post(`/subscriptions/subscriptions/`, data);
      return response.data;
    } catch (error: unknown) {
      return handleError(error, 'create subscription');
    }
  }

  // Update a subscription
  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
    try {
      const response = await api.patch(`/subscriptions/subscriptions/${id}/`, data);
      return response.data;
    } catch (error: unknown) {
      return handleError(error, 'update subscription');
    }
  }

  // Cancel a subscription
  async cancelSubscription(subscriptionId: number, endDate?: string): Promise<void> {
    if (!subscriptionId) {
      throw new Error('Subscription ID is required');
    }

    if (endDate) {
      const date = new Date(endDate);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid end date format');
      }
      if (date < new Date()) {
        throw new Error('End date cannot be in the past');
      }
    }

    try {
      await api.post(`/subscriptions/subscriptions/${subscriptionId}/cancel/`, { end_date: endDate });
    } catch (error: unknown) {
      return handleError(error, 'cancel subscription');
    }
  }

  // Convert trial to active subscription
  async convertTrialToActive(subscriptionId: number): Promise<Subscription> {
    try {
      const response = await api.post(`/subscriptions/subscriptions/${subscriptionId}/convert-trial/`);
      return response.data;
    } catch (error) {
      console.error('Error converting trial to active:', error);
      throw error;
    }
  }

  // Reactivate a subscription
  async reactivateSubscription(subscriptionId: number): Promise<void> {
    try {
      await api.post(`/subscriptions/subscriptions/${subscriptionId}/reactivate/`);
    } catch (error: unknown) {
      return handleError(error, 'reactivate subscription');
    }
  }

  // Delete a subscription
  async deleteSubscription(subscriptionId: number): Promise<void> {
    try {
      await api.delete(`/subscriptions/subscriptions/${subscriptionId}/`);
    } catch (error: unknown) {
      return handleError(error, 'delete subscription');
    }
  }

  // Get payment history for a subscription
  async getPaymentHistory(subscriptionId: number): Promise<Payment[]> {
    try {
      const response = await api.get(`/subscriptions/subscriptions/${subscriptionId}/payments/`);
      return response.data.results;
    } catch (error: unknown) {
      return handleError(error, 'fetch payment history');
    }
  }

  // Helper function to convert invoice numeric fields
  private convertInvoice(invoice: Record<string, any>): Invoice {
    const customerName = invoice.subscription?.customer ? 
      `${invoice.subscription.customer.first_name} ${invoice.subscription.customer.last_name}`.trim() : 
      'Unknown Customer';
    
    const customerEmail = invoice.subscription?.customer?.email || 'No Email';

    return {
      id: invoice.id,
      invoice_number: invoice.invoice_number || `INV-${invoice.id}`,
      subscription: invoice.subscription,
      customer_name: customerName,
      customer_email: customerEmail,
      currency: invoice.currency || 'ETB',
      payment_method: invoice.payment_method,
      status: invoice.status,
      due_date: invoice.due_date,
      amount: typeof invoice.amount === 'number' ? invoice.amount : parseFloat(invoice.amount || '0'),
      remaining_balance: typeof invoice.remaining_balance === 'number' ? invoice.remaining_balance : parseFloat(invoice.remaining_balance || '0'),
      total_paid: typeof invoice.total_paid === 'number' ? invoice.total_paid : parseFloat(invoice.total_paid || '0'),
      created_at: invoice.created_at || new Date().toISOString(),
      updated_at: invoice.updated_at || new Date().toISOString()
    };
  }

  // Get invoices for a subscription
  async getSubscriptionInvoices(subscriptionId: number): Promise<Invoice[]> {
    try {
      const response = await api.get(`/subscriptions/subscriptions/${subscriptionId}/invoices/`);
      const invoices = response.data.results || [];
      return invoices.map((invoice: any) => this.convertInvoice(invoice));
    } catch (error) {
      console.error('Error fetching subscription invoices:', error);
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();
