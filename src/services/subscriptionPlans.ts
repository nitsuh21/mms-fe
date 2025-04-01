import api from './api';

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'D' | 'W' | 'M' | 'Y';
  trial_days: number;
  features: Record<string, boolean>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionPlan {
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'D' | 'W' | 'M' | 'Y';
  trial_days: number;
  features: Record<string, boolean>;
  is_active?: boolean;
}

export interface UpdateSubscriptionPlan extends Partial<CreateSubscriptionPlan> {}

export const subscriptionPlansService = {
  // Get all subscription plans
  getAll: async (): Promise<SubscriptionPlan[]> => {
    const response = await api.get('/subscriptions/plans/');
    return response.data;
  },

  // Get a specific subscription plan
  getById: async (id: number): Promise<SubscriptionPlan> => {
    const response = await api.get(`/subscriptions/plans/${id}/`);
    return response.data;
  },

  // Create a new subscription plan
  create: async (data: CreateSubscriptionPlan): Promise<SubscriptionPlan> => {
    const response = await api.post('/subscriptions/plans/', data);
    return response.data;
  },

  // Update a subscription plan
  update: async (id: number, data: UpdateSubscriptionPlan): Promise<SubscriptionPlan> => {
    const response = await api.put(`/subscriptions/plans/${id}/`, data);
    return response.data;
  },

  // Delete a subscription plan
  delete: async (id: number): Promise<void> => {
    await api.delete(`/subscriptions/plans/${id}/`);
  },
};
