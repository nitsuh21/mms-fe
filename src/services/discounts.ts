import api from './api';

export interface Discount {
  id: string;
  business: string;
  name: string;
  code: string;
  description: string;
  discount_type: 'P' | 'F'; // Percentage or Fixed Amount
  discount_value: string;
  discount_category: 'P' | 'D'; // Promo Code or Discount Code
  valid_from: string;
  valid_until: string;
  scope: 'A' | 'S'; // All Plans or Specific Plans
  specific_plans?: string[];
  max_uses: string;
  times_used: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddDiscountParams {
  business: string;
  name: string;
  code: string;
  description: string;
  discount_type: 'P' | 'F';
  discount_value: string;
  discount_category: 'P' | 'D';
  valid_from: string;
  valid_until: string;
  scope: 'A' | 'S';
  specific_plans?: string[];
  max_uses: string;
  is_active: boolean;
}

export interface UpdateDiscountParams {
  name?: string;
  code?: string;
  description?: string;
  discount_type?: 'P' | 'F';
  discount_value?: string;
  discount_category?: 'P' | 'D';
  valid_from?: string;
  valid_until?: string;
  scope?: 'A' | 'S';
  specific_plans?: string[];
  max_uses?: string;
  business: string; // Required field
  is_active?: boolean;
}

export const discountsService = {
  getAll: async (): Promise<Discount[]> => {
    try {
      const response = await api.get('/subscriptions/discounts/');
      const data = response.data;
      return 'results' in data ? data.results : data;
    } catch (error) {
      console.error('Error fetching discounts:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Discount> => {
    try {
      const response = await api.get(`/subscriptions/discounts/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching discount ${id}:`, error);
      throw error;
    }
  },

  create: async (data: AddDiscountParams): Promise<Discount> => {
    try {
      const response = await api.post('/subscriptions/discounts/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating discount:', error);
      throw error;
    }
  },

  update: async (id: string, data: UpdateDiscountParams): Promise<Discount> => {
    try {
      const response = await api.put(`/subscriptions/discounts/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating discount ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/subscriptions/discounts/${id}/`);
    } catch (error) {
      console.error(`Error deleting discount ${id}:`, error);
      throw error;
    }
  },

  applyToPlan: async (planId: string, discountId: string): Promise<void> => {
    try {
      await api.post(`/subscriptions/subscription-plans/${planId}/discounts/${discountId}/apply/`);
    } catch (error) {
      console.error(`Error applying discount ${discountId} to plan ${planId}:`, error);
      throw error;
    }
  },

  removeFromPlan: async (planId: string, discountId: string): Promise<void> => {
    try {
      await api.post(`/subscriptions/subscription-plans/${planId}/discounts/${discountId}/remove/`);
    } catch (error) {
      console.error(`Error removing discount ${discountId} from plan ${planId}:`, error);
      throw error;
    }
  },
};
