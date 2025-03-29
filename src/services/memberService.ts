import api from './api';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  subscriptionType: string;
  status: 'active' | 'expired' | 'expiring';
  nextPayment: string;
}

export interface MemberCreateData {
  name: string;
  email: string;
  phone: string;
  subscriptionType: string;
}

export interface MemberUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  subscriptionType?: string;
}

export const memberService = {
  // Get all members for a business
  getMembers: async (merchantId: string, businessId: string): Promise<Member[]> => {
    const response = await api.get(`/tenant/customers/?tenant=${merchantId}`);
    
    return response.data.map((customer: any) => {
      // Find active subscription if any
      const activeSubscription = customer.subscriptions?.find((s: any) => s.is_active);
      
      // Determine status based on subscription
      let status: 'active' | 'expired' | 'expiring' = 'expired';
      let nextPayment = '';
      let subscriptionType = 'None';
      
      if (activeSubscription) {
        const endDate = new Date(activeSubscription.end_date);
        const now = new Date();
        const daysUntilExpiry = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry > 7) {
          status = 'active';
        } else if (daysUntilExpiry > 0) {
          status = 'expiring';
        } else {
          status = 'expired';
        }
        
        nextPayment = activeSubscription.end_date;
        subscriptionType = activeSubscription.plan_name;
      }
      
      return {
        id: customer.id,
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        phone: customer.phone_number || 'N/A',
        subscriptionType,
        status,
        nextPayment,
      };
    });
  },

  // Get a single member by ID
  getMember: async (merchantId: string, businessId: string, memberId: string): Promise<Member> => {
    const response = await api.get(`/tenant/customers/${memberId}/`);
    const customer = response.data;
    
    // Find active subscription if any
    const activeSubscription = customer.subscriptions?.find((s: any) => s.is_active);
    
    // Determine status based on subscription
    let status: 'active' | 'expired' | 'expiring' = 'expired';
    let nextPayment = '';
    let subscriptionType = 'None';
    
    if (activeSubscription) {
      const endDate = new Date(activeSubscription.end_date);
      const now = new Date();
      const daysUntilExpiry = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry > 7) {
        status = 'active';
      } else if (daysUntilExpiry > 0) {
        status = 'expiring';
      } else {
        status = 'expired';
      }
      
      nextPayment = activeSubscription.end_date;
      subscriptionType = activeSubscription.plan_name;
    }
    
    return {
      id: customer.id,
      name: `${customer.first_name} ${customer.last_name}`,
      email: customer.email,
      phone: customer.phone_number || 'N/A',
      subscriptionType,
      status,
      nextPayment,
    };
  },

  // Create a new member
  createMember: async (merchantId: string, businessId: string, data: MemberCreateData): Promise<Member> => {
    const nameParts = data.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const response = await api.post('/tenant/customers/', {
      tenant: merchantId,
      first_name: firstName,
      last_name: lastName,
      email: data.email,
      phone_number: data.phone,
    });
    
    const customer = response.data;
    
    return {
      id: customer.id,
      name: `${customer.first_name} ${customer.last_name}`,
      email: customer.email,
      phone: customer.phone_number || 'N/A',
      subscriptionType: 'None',
      status: 'expired',
      nextPayment: '',
    };
  },

  // Update an existing member
  updateMember: async (merchantId: string, businessId: string, memberId: string, data: MemberUpdateData): Promise<Member> => {
    const updateData: any = {};
    
    if (data.name) {
      const nameParts = data.name.split(' ');
      updateData.first_name = nameParts[0];
      updateData.last_name = nameParts.slice(1).join(' ');
    }
    
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone_number = data.phone;
    
    const response = await api.patch(`/tenant/customers/${memberId}/`, updateData);
    const customer = response.data;
    
    // Find active subscription if any
    const activeSubscription = customer.subscriptions?.find((s: any) => s.is_active);
    
    // Determine status based on subscription
    let status: 'active' | 'expired' | 'expiring' = 'expired';
    let nextPayment = '';
    let subscriptionType = 'None';
    
    if (activeSubscription) {
      const endDate = new Date(activeSubscription.end_date);
      const now = new Date();
      const daysUntilExpiry = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry > 7) {
        status = 'active';
      } else if (daysUntilExpiry > 0) {
        status = 'expiring';
      } else {
        status = 'expired';
      }
      
      nextPayment = activeSubscription.end_date;
      subscriptionType = activeSubscription.plan_name;
    }
    
    return {
      id: customer.id,
      name: `${customer.first_name} ${customer.last_name}`,
      email: customer.email,
      phone: customer.phone_number || 'N/A',
      subscriptionType,
      status,
      nextPayment,
    };
  },

  // Delete a member
  deleteMember: async (merchantId: string, businessId: string, memberId: string): Promise<void> => {
    await api.delete(`/tenant/customers/${memberId}/`);
  },
};
