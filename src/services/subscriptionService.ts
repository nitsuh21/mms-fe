import api from './api';

export interface Subscription {
  id: string;
  member: {
    name: string;
    email: string;
  };
  plan: {
    name: string;
    price: number;
  };
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  lastPayment: string;
  nextPayment: string;
}

export interface SubscriptionCreateData {
  memberId: string;
  planId: string;
  startDate: string;
  autoRenew?: boolean;
}

export interface SubscriptionUpdateData {
  planId?: string;
  status?: 'active' | 'cancelled' | 'expired' | 'pending';
  autoRenew?: boolean;
  endDate?: string;
}

// Helper function to convert backend status to frontend status
const mapStatus = (backendStatus: string): 'active' | 'cancelled' | 'expired' | 'pending' => {
  switch (backendStatus) {
    case 'AC': return 'active';
    case 'CA': return 'cancelled';
    case 'EX': return 'expired';
    case 'PE': return 'pending';
    default: return 'pending';
  }
};

export const subscriptionService = {
  // Get all subscriptions for a business
  getSubscriptions: async (merchantId: string, businessId: string): Promise<Subscription[]> => {
    const response = await api.get(`/tenant/subscriptions/?tenant=${merchantId}`);
    
    return response.data.map((sub: any) => {
      // Calculate last payment and next payment dates
      const startDate = new Date(sub.start_date);
      const endDate = new Date(sub.end_date);
      const now = new Date();
      
      // For simplicity, assume last payment was start date and next payment is end date
      // In a real app, you'd have actual payment records
      const lastPayment = sub.start_date;
      const nextPayment = sub.end_date;
      
      return {
        id: sub.id,
        member: {
          name: `${sub.customer.first_name} ${sub.customer.last_name}`,
          email: sub.customer.email,
        },
        plan: {
          name: sub.plan_name || (sub.plan ? sub.plan.name : 'Unknown Plan'),
          price: sub.price || (sub.plan ? sub.plan.price : 0),
        },
        status: mapStatus(sub.status),
        startDate: sub.start_date,
        endDate: sub.end_date,
        autoRenew: sub.auto_renew,
        lastPayment,
        nextPayment,
      };
    });
  },

  // Get a single subscription by ID
  getSubscription: async (merchantId: string, businessId: string, subscriptionId: string): Promise<Subscription> => {
    const response = await api.get(`/tenant/subscriptions/${subscriptionId}/`);
    const sub = response.data;
    
    // Calculate last payment and next payment dates
    const startDate = new Date(sub.start_date);
    const endDate = new Date(sub.end_date);
    
    // For simplicity, assume last payment was start date and next payment is end date
    const lastPayment = sub.start_date;
    const nextPayment = sub.end_date;
    
    return {
      id: sub.id,
      member: {
        name: `${sub.customer.first_name} ${sub.customer.last_name}`,
        email: sub.customer.email,
      },
      plan: {
        name: sub.plan_name || (sub.plan ? sub.plan.name : 'Unknown Plan'),
        price: sub.price || (sub.plan ? sub.plan.price : 0),
      },
      status: mapStatus(sub.status),
      startDate: sub.start_date,
      endDate: sub.end_date,
      autoRenew: sub.auto_renew,
      lastPayment,
      nextPayment,
    };
  },

  // Create a new subscription
  createSubscription: async (merchantId: string, businessId: string, data: SubscriptionCreateData): Promise<Subscription> => {
    // Calculate end date based on plan duration
    const planResponse = await api.get(`/tenant/subscription-plans/${data.planId}/`);
    const plan = planResponse.data;
    
    const startDate = new Date(data.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.duration_months);
    
    const response = await api.post('/tenant/subscriptions/', {
      customer: data.memberId,
      plan: data.planId,
      start_date: data.startDate,
      end_date: endDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      status: 'AC', // Active
      is_active: true,
      auto_renew: data.autoRenew !== undefined ? data.autoRenew : true,
    });
    
    const sub = response.data;
    
    return {
      id: sub.id,
      member: {
        name: `${sub.customer.first_name} ${sub.customer.last_name}`,
        email: sub.customer.email,
      },
      plan: {
        name: sub.plan_name || (sub.plan ? sub.plan.name : plan.name),
        price: sub.price || (sub.plan ? sub.plan.price : plan.price),
      },
      status: 'active',
      startDate: sub.start_date,
      endDate: sub.end_date,
      autoRenew: sub.auto_renew,
      lastPayment: sub.start_date,
      nextPayment: sub.end_date,
    };
  },

  // Update an existing subscription
  updateSubscription: async (merchantId: string, businessId: string, subscriptionId: string, data: SubscriptionUpdateData): Promise<Subscription> => {
    const updateData: any = {};
    
    if (data.planId) updateData.plan = data.planId;
    if (data.status) updateData.status = data.status.charAt(0).toUpperCase() + data.status.slice(1, 2);
    if (data.autoRenew !== undefined) updateData.auto_renew = data.autoRenew;
    if (data.endDate) updateData.end_date = data.endDate;
    
    const response = await api.patch(`/tenant/subscriptions/${subscriptionId}/`, updateData);
    const sub = response.data;
    
    return {
      id: sub.id,
      member: {
        name: `${sub.customer.first_name} ${sub.customer.last_name}`,
        email: sub.customer.email,
      },
      plan: {
        name: sub.plan_name || (sub.plan ? sub.plan.name : 'Unknown Plan'),
        price: sub.price || (sub.plan ? sub.plan.price : 0),
      },
      status: mapStatus(sub.status),
      startDate: sub.start_date,
      endDate: sub.end_date,
      autoRenew: sub.auto_renew,
      lastPayment: sub.start_date,
      nextPayment: sub.end_date,
    };
  },

  // Cancel a subscription
  cancelSubscription: async (merchantId: string, businessId: string, subscriptionId: string): Promise<Subscription> => {
    const response = await api.post(`/tenant/subscriptions/${subscriptionId}/cancel/`);
    const sub = response.data;
    
    return {
      id: sub.id,
      member: {
        name: `${sub.customer.first_name} ${sub.customer.last_name}`,
        email: sub.customer.email,
      },
      plan: {
        name: sub.plan_name || (sub.plan ? sub.plan.name : 'Unknown Plan'),
        price: sub.price || (sub.plan ? sub.plan.price : 0),
      },
      status: 'cancelled',
      startDate: sub.start_date,
      endDate: sub.end_date,
      autoRenew: false,
      lastPayment: sub.start_date,
      nextPayment: '',
    };
  },

  // Renew a subscription
  renewSubscription: async (merchantId: string, businessId: string, subscriptionId: string): Promise<Subscription> => {
    const response = await api.post(`/tenant/subscriptions/${subscriptionId}/renew/`);
    const sub = response.data;
    
    return {
      id: sub.id,
      member: {
        name: `${sub.customer.first_name} ${sub.customer.last_name}`,
        email: sub.customer.email,
      },
      plan: {
        name: sub.plan_name || (sub.plan ? sub.plan.name : 'Unknown Plan'),
        price: sub.price || (sub.plan ? sub.plan.price : 0),
      },
      status: 'active',
      startDate: sub.start_date,
      endDate: sub.end_date,
      autoRenew: sub.auto_renew,
      lastPayment: sub.start_date,
      nextPayment: sub.end_date,
    };
  },
};
