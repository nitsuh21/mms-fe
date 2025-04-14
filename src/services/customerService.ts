import api from "./api";

export interface Customer {
  id: number;
  business: number;
  user: number | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sync_status?: string;
  membership_request_id?: number;
  membership_status?: string;
}

export interface CreateCustomerData {
  business: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_active?: boolean;
}

export interface UpdateCustomerData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
}

export interface MembershipRequest {
  id: number;
  business: number;
  customer: Customer;
  user?: number;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MembershipRequestData {
  business: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface MembershipRequestFilter {
  type?: string;
  status?: string;
}

export class CustomerService {
  // Get all customers for a business
  async getCustomers(businessId: string): Promise<Customer[]> {
    try {
      const response = await api.get(`/subscriptions/customers/?business=${businessId}`);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  // Get a specific customer
  async getCustomer(customerId: number): Promise<Customer> {
    try {
      const response = await api.get(`/subscriptions/customers/${customerId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  // Create a new customer (with membership request)
  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    try {
      const response = await api.post(`/subscriptions/businesses/${data.business}/customers/`, {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        is_active: data.is_active ?? true
      });
      return response.data.customer;
    } catch (error: any) {
      console.error('Error creating customer:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error;
    }
  }

  // Update a customer
  async updateCustomer(customerId: number, data: UpdateCustomerData): Promise<Customer> {
    try {
      const response = await api.put(`/subscriptions/customers/${customerId}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Delete a customer
  async deleteCustomer(customerId: number): Promise<void> {
    try {
      await api.delete(`/subscriptions/customers/${customerId}/`);
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Get customer's membership status
  async getCustomerMembershipStatus(customerId: number): Promise<string> {
    try {
      const response = await api.get(`/subscriptions/customers/${customerId}/membership-status/`);
      return response.data.status;
    } catch (error) {
      console.error('Error fetching membership status:', error);
      throw error;
    }
  }

  // Get membership request details
  async getMembershipRequestDetails(requestId: number): Promise<MembershipRequest> {
    try {
      const response = await api.get(`/subscriptions/membership-requests/${requestId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching membership request details:', error);
      throw error;
    }
  }

  // Cancel a membership request
  async cancelMembershipRequest(requestId: number): Promise<void> {
    try {
      await api.delete(`/subscriptions/membership-requests/${requestId}/`);
    } catch (error) {
      console.error('Error canceling membership request:', error);
      throw error;
    }
  }

  // Get membership requests
  async getMembershipRequests(businessId: string, filters?: MembershipRequestFilter): Promise<MembershipRequest[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      
      const response = await api.get(`/subscriptions/businesses/${businessId}/membership-requests-made/?${params.toString()}`);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching membership requests:', error);
      throw error;
    }
  }

  // Approve a membership request
  async approveMembershipRequest(businessId: string, requestId: number): Promise<MembershipRequest> {
    try {
      const response = await api.post(`/subscriptions/businesses/${businessId}/sync-requests/${requestId}/approve/`);
      return response.data;
    } catch (error) {
      console.error('Error approving membership request:', error);
      throw error;
    }
  }
}

export const customerService = new CustomerService();
