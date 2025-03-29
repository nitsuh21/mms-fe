import api from './api';
import type { Business } from '@/types/business';

export const businessService = {
  // Get all businesses for a merchant
  getBusinesses: async (): Promise<Business[]> => {
    const response = await api.get('/businesses/businesses/');
    return response.data;
  },

  // Get a single business by ID
  getBusiness: async (id: number): Promise<Business> => {
    const response = await api.get(`/businesses/businesses/${id}/`);
    return response.data;
  },

  // Create a new business
  createBusiness: async (data: Partial<Business>): Promise<Business> => {
    const response = await api.post('/businesses/businesses/', data);
    return response.data;
  },

  // Update a business
  updateBusiness: async (id: number, data: Partial<Business>): Promise<Business> => {
    const response = await api.patch(`/businesses/businesses/${id}/`, data);
    return response.data;
  },

  // Delete a business
  deleteBusiness: async (id: number): Promise<void> => {
    await api.delete(`/businesses/businesses/${id}/`);
  },

  // Get business members
  getBusinessMembers: async (businessId: number) => {
    const response = await api.get(`/businesses/businesses/${businessId}/members/`);
    return response.data;
  },

  // Add business member
  addBusinessMember: async (businessId: number, email: string, role: string) => {
    const response = await api.post(`/businesses/businesses/${businessId}/members/`, {
      email,
      role
    });
    return response.data;
  },

  // Update business member
  updateBusinessMember: async (businessId: number, memberId: number, role: string) => {
    const response = await api.patch(`/businesses/businesses/${businessId}/members/${memberId}/`, {
      role
    });
    return response.data;
  },

  // Remove business member
  removeBusinessMember: async (businessId: number, memberId: number) => {
    await api.delete(`/businesses/businesses/${businessId}/members/${memberId}/`);
  }
};
