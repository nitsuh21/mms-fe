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
    features: Record<string, string>;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    discounts: any[];
  };
  customer: {
    id: number;
    user: number | null;
    first_name: string;
    last_name: string;
    business: number;
    email: string;
    phone: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  status: string;
  start_date: string;
  end_date: string;
  trial_end: string | null;
  next_billing_date: string;
  applied_discounts: any[];
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionData {
  customer: number;
  plan: number;
  start_date?: string;
  end_date?: string;
  trial_end?: string;
}

export interface UpdateSubscriptionData {
  status?: string;
  end_date?: string;
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

  // Create a new subscription
  async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
    try {
      const response = await api.post(`/subscriptions/subscriptions/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Update a subscription
  async updateSubscription(subscriptionId: number, data: UpdateSubscriptionData): Promise<Subscription> {
    try {
      const response = await api.patch(`/subscriptions/subscriptions/${subscriptionId}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Cancel a subscription
  async cancelSubscription(subscriptionId: number): Promise<void> {
    try {
      await api.post(`/subscriptions/subscriptions/${subscriptionId}/cancel/`);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
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
}

export const subscriptionService = new SubscriptionService();
