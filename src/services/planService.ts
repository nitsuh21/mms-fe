import api from "./api";
import { Member } from "./memberService";

export interface Discount {
  id: string;
  name: string;
  code: string;
  description?: string;
  discount_type: 'P' | 'F';
  discount_value: number;
  discount_category: 'P' | 'D';
  valid_from: string;
  valid_until: string;
  scope: 'A' | 'S';
  specific_plans?: number[];
  max_uses: number;
  times_used: number;
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
  features: string;
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
  features: string;
  is_active?: boolean;
}

export interface PlanUpdateData {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  interval?: 'D' | 'W' | 'M' | 'Y';
  trial_days?: number;
  features?: string;
  is_active?: boolean;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  business: string;
  interval: 'D' | 'W' | 'M' | 'Y';
  grace_period_days: number;
  price: number;
  discounted_price: number;
  has_trial: boolean;
  currency: string;
  trial_days: number;
  features: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  discounts?: Discount[];
}

export interface CreatePlanData {
  name: string;
  description: string;
  business: string;
  interval: 'D' | 'W' | 'M' | 'Y';
  grace_period_days: number;
  price: number;
  discounted_price: number;
  has_trial: boolean;
  currency: string;
  trial_days: number;
  features: string;
  is_active?: boolean;
}

export interface UpdatePlanData {
  name?: string;
  description?: string;
  price?: number;
  discounted_price?: number;
  has_trial?: boolean;
  currency?: string;
  interval?: 'D' | 'W' | 'M' | 'Y';
  grace_period_days?: number;
  trial_days?: number;
  features?: string;
  is_active?: boolean;
}


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
      const response = await api.get(`/subscriptions/subscription-plans/${planId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching plan:', error);
      throw error;
    }
  }

  // Create a new plan
  static async createPlan(data: CreatePlanData): Promise<Plan> {
    try {
      console.log("here is the create plandata", data)
      const response = await api.post(`/subscriptions/subscription-plans/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }

  // Update a plan
  static async updatePlan(planId: number, data: UpdatePlanData): Promise<Plan> {
    try {
      const response = await api.patch(`/subscriptions/subscription-plans/${planId}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  }

  // Delete a plan
  static async deletePlan(planId: number): Promise<void> {
    try {
      await api.delete(`/subscriptions/subscription-plans/${planId}/`);
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }

  // Get subscribers for a plan
  static async getPlanSubscribers(planId: number): Promise<Member[]> {
    try {
      const response = await api.get(`/subscriptions/subscription-plans/${planId}/subscribers/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching plan subscribers:', error);
      throw error;
    }
  }

  // Apply a discount to a plan
  static async applyDiscount(planId: number, discountId: string): Promise<void> {
    try {
      await api.post(`/subscriptions/subscription-plans/${planId}/discounts/`, { discount: discountId });
    } catch (error) {
      console.error('Error applying discount:', error);
      throw error;
    }
  }

  // Remove a discount from a plan
  static async removeDiscount(planId: number, discountId: string): Promise<void> {
    try {
      await api.delete(`/subscriptions/subscription-plans/${planId}/discounts/${discountId}/`);
    } catch (error) {
      console.error('Error removing discount:', error);
      throw error;
    }
  }
}

export default PlanService;
