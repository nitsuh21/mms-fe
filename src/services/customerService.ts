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

  // Create a new customer
  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    try {
      const response = await api.post(`/subscriptions/customers/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Update a customer
  async updateCustomer(customerId: number, data: UpdateCustomerData): Promise<Customer> {
    try {
      const response = await api.patch(`/subscriptions/customers/${customerId}/`, data);
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
}

export const customerService = new CustomerService();
