import api from "./api";

export interface Customer {
  customer_id: string;
  id: number;
  business: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

import { MembershipRequest } from '@/types/membership';

export interface CreateCustomerData {
  business: number;
  first_name: string;
  last_name: string;
  customer_id: string;
  email: string;
  phone: string;
  is_active?: boolean;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {}

export interface CreateCustomerResponse {
  customer: Customer;
  membership_request: MembershipRequest;
  message?: string;
}

const transformMembershipRequest = (data: any): MembershipRequest => ({
  ...data,
  business_name: data.business_name || '',
  user_email: data.user_email || null,
  customer_email: data.customer_email || '',
});

export class CustomerService {
  // Get customers for a business
  async getCustomers(): Promise<Customer[]> {
    try {
      const response = await api.get(`/subscriptions/customers/`);
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data?.results || [];
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.message || error.response.data.error);
      }
      throw new Error('Failed to fetch customers. Please try again.');
    }
  }

  // Get a single customer
  async getCustomer(customerId: number): Promise<Customer> {
    try {
      const response = await api.get(`/subscriptions/customers/${customerId}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error;
    }
  }

  // Create a membership request
  async createMembershipRequest(businessId: number, customerId: number, type: string = 'MEMBER'): Promise<MembershipRequest> {
    try {
      const response = await api.post(`/subscriptions/businesses/${businessId}/membership-requests/`, {
        customer: customerId,
        type: type
      });
      return transformMembershipRequest(response.data);
    } catch (error: any) {
      console.error('Error creating membership request:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to create membership request. Please try again.');
    }
  }

  // Get membership requests for a business
  async getMembershipRequests(businessId: string | number, filters?: { type?: string }): Promise<MembershipRequest[]> {
    try {
      const response = await api.get(`/subscriptions/businesses/${businessId}/membership-requests/`, {
        params: filters
      });
      return response.data.map(transformMembershipRequest);
    } catch (error: any) {
      console.error('Error getting membership requests:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error;
    }
  }

  // Get membership request details
  async getMembershipRequestDetails(requestId: number): Promise<MembershipRequest> {
    try {
      const response = await api.get(`/subscriptions/membership-requests/${requestId}/`);
      return transformMembershipRequest(response.data);
    } catch (error) {
      console.error('Error fetching membership request details:', error);
      throw error;
    }
  }

  // Create a new customer (with membership request)
  async createCustomer(data: CreateCustomerData): Promise<CreateCustomerResponse> {
    try {
      const response = await api.post(`/subscriptions/customers/`, {
        business: data.business,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        customer_id: data.customer_id,
        phone: data.phone,
        is_active: data.is_active ?? true
      });

      // Create a membership request for this customer
      const membershipRequest = await this.createMembershipRequest(data.business, response.data.id);

      return {
        customer: response.data,
        membership_request: membershipRequest
      };
    } catch (error: any) {
      console.error('Error creating customer:', error);
      if (error.response?.data?.details?.non_field_errors) {
        throw new Error(error.response.data.details.non_field_errors.join('\n'));
      } else if (error.response?.data?.error) {
        // Handle structured error response
        const errorData = error.response.data;
        const errorMessage = errorData.message || 
          (errorData.details ? Object.values(errorData.details).flat().join('\n') : errorData.error);
        throw new Error(errorMessage);
      } else if (error.response?.data?.detail) {
        // Handle DRF default error format
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to create member. Please try again.');
    }
  }

  // Update a customer
  async updateCustomer(customerId: number, data: UpdateCustomerData): Promise<Customer> {
    try {
      const response = await api.put(`/subscriptions/customers/${customerId}/`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating customer:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error;
    }
  }

  // Delete a customer
  async deleteCustomer(memberId: number): Promise<void> {
    try {
      await api.delete(`/subscriptions/customers/${memberId}/`);
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error;
    }
  }

  // Approve a membership request
  async approveMembershipRequest(businessId: string | number, requestId: number): Promise<void> {
    try {
      await api.post(`/subscriptions/businesses/${businessId}/membership-requests/${requestId}/approve/`);
    } catch (error: any) {
      console.error('Error approving membership request:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error;
    }
  }

  // Reject a membership request
  async rejectMembershipRequest(businessId: string | number, requestId: number): Promise<void> {
    try {
      await api.post(`/subscriptions/businesses/${businessId}/membership-requests/${requestId}/reject/`);
    } catch (error: any) {
      console.error('Error rejecting membership request:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error;
    }
  }

  // Cancel a membership request
  async cancelMembershipRequest(requestId: number): Promise<void> {
    try {
      await api.delete(`/subscriptions/membership-requests/${requestId}/`);
    } catch (error: any) {
      console.error('Error canceling membership request:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error;
    }
  }

  // Get membership requests made
  async getMembershipRequestsMade(businessId: string, filters?: { type?: string; status?: string }): Promise<MembershipRequest[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      
      const response = await api.get(`/subscriptions/businesses/${businessId}/membership-requests/`, {
        params: filters
      });
      return response.data.map(transformMembershipRequest);
    } catch (error) {
      console.error('Error fetching membership requests:', error);
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

  // Approve a membership request made
  async approveMembershipRequestMade(businessId: string, requestId: number): Promise<MembershipRequest> {
    try {
      const response = await api.post(`/subscriptions/businesses/${businessId}/sync-requests/${requestId}/approve/`);
      return transformMembershipRequest(response.data);
    } catch (error) {
      console.error('Error approving membership request:', error);
      throw error;
    }
  }
}

export const customerService = new CustomerService();
