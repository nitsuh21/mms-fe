import api from "./api";

export interface Subscription {
  id: number;
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
    features: Record<string, any>;
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
  status: 'AC' | 'PD' | 'CN' | 'TR' | 'EX';
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
  status?: 'AC' | 'PD' | 'CN' | 'TR' | 'EX';
  trial_end?: string;
}

export interface UpdateSubscriptionData {
  status?: 'AC' | 'PD' | 'CN' | 'TR' | 'EX';
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

export class SubscriptionService {
  // Get all subscriptions for a business
  async getSubscriptions(businessId: string): Promise<Subscription[]> {
    try {
      const response = await api.get(`/subscriptions/subscriptions/?business=${businessId}`);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  // Get a specific subscription
  async getSubscription(subscriptionId: number): Promise<Subscription> {
    try {
      const response = await api.get(`/subscriptions/subscriptions/${subscriptionId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  // Check if a customer has an active subscription
  async hasActiveSubscription(businessId: string, customerId: number): Promise<boolean> {
    try {
      const response = await api.get(`/subscriptions/subscriptions/?business=${businessId}&customer=${customerId}&status=AC,TR`);
      return response.data.results.length > 0;
    } catch (error) {
      console.error('Error checking active subscription:', error);
      throw error;
    }
  }

  // Create a new subscription
  async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
    try {
      const response = await api.post(`/subscriptions/subscriptions/`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating subscription:', error.response?.data || error);
      throw error.response?.data || error;
    }
  }

  // Update a subscription
  async updateSubscription(id: number, data: UpdateSubscriptionData): Promise<Subscription> {
    try {
      const response = await api.patch(`/subscriptions/subscriptions/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Cancel a subscription
  async cancelSubscription(subscriptionId: number, endDate?: string): Promise<void> {
    try {
      await api.post(`/subscriptions/subscriptions/${subscriptionId}/cancel/`, { end_date: endDate });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
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
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  // Delete a subscription
  async deleteSubscription(subscriptionId: number): Promise<void> {
    try {
      await api.delete(`/subscriptions/subscriptions/${subscriptionId}/`);
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  }

  // Get payment history for a subscription
  async getPaymentHistory(subscriptionId: number): Promise<Payment[]> {
    try {
      const response = await api.get(`/subscriptions/subscriptions/${subscriptionId}/payments/`);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();
