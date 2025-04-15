import api from "./api";

export interface Discount {
  id: string;
  business: string;
  name: string;
  code: string;
  description: string;
  discount_type: 'P' | 'F';
  discount_value: string;
  discount_category: 'P' | 'D';
  is_recurring: 'O' | 'R';
  cycle_limit?: string;
  valid_from: string;
  valid_until: string;
  scope: 'A' | 'S';
  specific_plans?: string[];
  max_uses: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  status: string;
  id: string;
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
  discounts?: Discount[];
  activeSubscribers?: number;
}

export interface PlanCreateData {
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'D' | 'W' | 'M' | 'Y';
  trial_days: number;
  features: Record<string, boolean>;
  is_active?: boolean;
}

export interface PlanUpdateData {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  interval?: 'D' | 'W' | 'M' | 'Y';
  trial_days?: number;
  features?: Record<string, boolean>;
  is_active?: boolean;
}

export interface Plan {
  id: number;
  business: number;
  name: string;
  description: string;
  price: string;
  currency: string;
  interval: 'D' | 'W' | 'M' | 'Y';
  trial_days: number;
  has_trial: boolean;
  duration_months: number;
  features: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  discounts?: Discount[];
  activeSubscribers?: number;
}

export interface CreatePlanData {
  name: string;
  description: string;
  business: string;
  interval: 'D' | 'W' | 'M' | 'Y';
  price: number;
  currency: string;
  trial_days: number;
  features: Record<string, boolean>;
  is_active?: boolean;
}

export interface UpdatePlanData {
  name?: string;
  description?: string;
  price?: number;
  business?: string;
  currency?: string;
  interval?: 'D' | 'W' | 'M' | 'Y';
  trial_days?: number;
  features?: Record<string, boolean>;
  is_active?: boolean;
}

// Helper function to convert billing period to months
const billingPeriodToMonths = (period: 'D' | 'W' | 'M' | 'Y'): number => {
  switch (period) {
    case 'D': return 1;
    case 'W': return 7;
    case 'M': return 30;
    case 'Y': return 365;
    default: return 30;
  }
};

// Helper function to convert months to billing period
const monthsToBillingPeriod = (days: number): 'D' | 'W' | 'M' | 'Y' => {
  if (days === 1) return 'D';
  if (days === 7) return 'W';
  if (days === 30) return 'M';
  return 'Y';
};

export class PlanService {
  // interval: string;
  // discounts: any;
  // id: string;
  // currency: string | undefined;
  // name: ReactNode;
  // description: ReactNode;
  // price: ReactNode;
  // Get all plans for a business
  static async getPlans(businessId: string): Promise<Plan[]> {
    try {
      const response = await api.get(`/subscriptions/subscription-plans/?business=${businessId}`);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  }

  // Get a specific plan
  static async getPlan(planId: number): Promise<Plan> {
    try {
      const response = await api.get(`/subscriptios/subscription-plans/${planId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching plan:', error);
      throw error;
    }
  }

  // Create a new plan
  static async createPlan(data: CreatePlanData): Promise<Plan> {
    try {
      const response = await api.post(`/subscriptios/subscription-plans/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }

  // Update a plan
  static async updatePlan(planId: number, data: UpdatePlanData): Promise<Plan> {
    try {
      const response = await api.patch(`/subscriptios/subscription-plans/${planId}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  }

  // Delete a plan
  static async deletePlan(planId: number): Promise<void> {
    try {
      await api.delete(`/subscriptios/subscription-plans/${planId}/`);
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }

  // Get subscribers for a plan
  static async getPlanSubscribers(planId: number): Promise<any[]> {
    try {
      const response = await api.get(`/subscriptios/subscription-plans/${planId}/subscribers/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching plan subscribers:', error);
      throw error;
    }
  }

  // Apply a discount to a plan
  static async applyDiscount(planId: number, discountId: string): Promise<void> {
    try {
      await api.post(`/subscriptios/subscription-plans/${planId}/discounts/`, { discount: discountId });
    } catch (error) {
      console.error('Error applying discount:', error);
      throw error;
    }
  }

  // Remove a discount from a plan
  static async removeDiscount(planId: number, discountId: string): Promise<void> {
    try {
      await api.delete(`/subscriptios/subscription-plans/${planId}/discounts/${discountId}/`);
    } catch (error) {
      console.error('Error removing discount:', error);
      throw error;
    }
  }
}

export default PlanService;
