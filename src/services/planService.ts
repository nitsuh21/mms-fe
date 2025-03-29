import api from './api';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'quarterly' | 'annual';
  features: string[];
  activeSubscribers: number;
  status: 'active' | 'draft' | 'archived';
}

export interface PlanCreateData {
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'quarterly' | 'annual';
  features: string[];
  status?: 'active' | 'draft' | 'archived';
}

export interface PlanUpdateData {
  name?: string;
  description?: string;
  price?: number;
  billingPeriod?: 'monthly' | 'quarterly' | 'annual';
  features?: string[];
  status?: 'active' | 'draft' | 'archived';
}

// Helper function to convert billing period to months
const billingPeriodToMonths = (period: 'monthly' | 'quarterly' | 'annual'): number => {
  switch (period) {
    case 'monthly': return 1;
    case 'quarterly': return 3;
    case 'annual': return 12;
    default: return 1;
  }
};

// Helper function to convert months to billing period
const monthsToBillingPeriod = (months: number): 'monthly' | 'quarterly' | 'annual' => {
  switch (months) {
    case 1: return 'monthly';
    case 3: return 'quarterly';
    case 12: return 'annual';
    default: return 'monthly';
  }
};

export const planService = {
  // Get all plans for a merchant
  getPlans: async (merchantId: string, businessId: string): Promise<SubscriptionPlan[]> => {
    const response = await api.get(`/tenant/subscription-plans/?tenant=${merchantId}`);
    
    return response.data.map((plan: any) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      billingPeriod: monthsToBillingPeriod(plan.duration_months),
      features: plan.features ? Object.values(plan.features) : [],
      activeSubscribers: 0, // This would need to be calculated on the backend
      status: plan.is_active ? 'active' : 'archived',
    }));
  },

  // Get a single plan by ID
  getPlan: async (merchantId: string, businessId: string, planId: string): Promise<SubscriptionPlan> => {
    const response = await api.get(`/tenant/subscription-plans/${planId}/`);
    const plan = response.data;
    
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      billingPeriod: monthsToBillingPeriod(plan.duration_months),
      features: plan.features ? Object.values(plan.features) : [],
      activeSubscribers: 0, // This would need to be calculated on the backend
      status: plan.is_active ? 'active' : 'archived',
    };
  },

  // Create a new plan
  createPlan: async (merchantId: string, businessId: string, data: PlanCreateData): Promise<SubscriptionPlan> => {
    const response = await api.post('/tenant/subscription-plans/', {
      tenant: merchantId,
      name: data.name,
      description: data.description,
      price: data.price,
      duration_months: billingPeriodToMonths(data.billingPeriod),
      features: data.features.reduce((obj, feature, index) => {
        obj[`feature_${index + 1}`] = feature;
        return obj;
      }, {} as Record<string, string>),
      is_active: data.status === 'active',
    });
    
    const plan = response.data;
    
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      billingPeriod: monthsToBillingPeriod(plan.duration_months),
      features: plan.features ? Object.values(plan.features) : [],
      activeSubscribers: 0,
      status: plan.is_active ? 'active' : 'archived',
    };
  },

  // Update an existing plan
  updatePlan: async (merchantId: string, businessId: string, planId: string, data: PlanUpdateData): Promise<SubscriptionPlan> => {
    const updateData: any = {};
    
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.price) updateData.price = data.price;
    if (data.billingPeriod) updateData.duration_months = billingPeriodToMonths(data.billingPeriod);
    if (data.features) {
      updateData.features = data.features.reduce((obj, feature, index) => {
        obj[`feature_${index + 1}`] = feature;
        return obj;
      }, {} as Record<string, string>);
    }
    if (data.status !== undefined) updateData.is_active = data.status === 'active';
    
    const response = await api.patch(`/tenant/subscription-plans/${planId}/`, updateData);
    const plan = response.data;
    
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      billingPeriod: monthsToBillingPeriod(plan.duration_months),
      features: plan.features ? Object.values(plan.features) : [],
      activeSubscribers: 0, // This would need to be calculated on the backend
      status: plan.is_active ? 'active' : 'archived',
    };
  },

  // Delete a plan
  deletePlan: async (merchantId: string, businessId: string, planId: string): Promise<void> => {
    await api.delete(`/tenant/subscription-plans/${planId}/`);
  },

  // Get subscribers for a plan
  getPlanSubscribers: async (merchantId: string, businessId: string, planId: string): Promise<any[]> => {
    const response = await api.get(`/tenant/subscription-plans/${planId}/subscribers/`);
    return response.data;
  },
};
