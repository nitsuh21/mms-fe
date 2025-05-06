import api from './api';
import type { Business } from '@/types/business';

export const businessService = {
  // Get all businesses for a merchant
  getBusinesses: async (): Promise<Business[]> => {
    const response = await api.get('/businesses/businesses/');
    return response.data;
  },

  // Get a single business by ID
  getBusiness: async (id: string): Promise<Business> => {
    const response = await api.get(`/businesses/businesses/${id}/`);
    return response.data;
  },

  // Create a new business
  createBusiness: async (data: Partial<Business>): Promise<Business> => {
    const response = await api.post('/businesses/businesses/', data);
    return response.data;
  },

  // Update a business
  updateBusiness: async (id: string, data: Partial<Business>): Promise<Business> => {
    console.log({data});
    const response = await api.patch(`/businesses/businesses/${id}/`, data);
    return response.data;
  },

  // Delete a business
  deleteBusiness: async (id: string): Promise<void> => {
    await api.delete(`/businesses/businesses/${id}/`);
  },

  // Get business members
  getBusinessMembers: async (businessId: string): Promise<any[]> => {
    const response = await api.get(`/businesses/businesses/${businessId}/members/`);
    return response.data;
  },

  // Add business member
  addBusinessMember: async (businessId: string, email: string, role: string): Promise<any> => {
    const response = await api.post(`/businesses/businesses/${businessId}/members/`, {
      email,
      role
    });
    return response.data;
  },

  // Update business member
  updateBusinessMember: async (businessId: string, memberId: string, role: string): Promise<any> => {
    const response = await api.patch(`/businesses/businesses/${businessId}/members/${memberId}/`, {
      role
    });
    return response.data;
  },

  // Remove business member
  removeBusinessMember: async (businessId: string, memberId: string): Promise<void> => {
    await api.delete(`/businesses/businesses/${businessId}/members/${memberId}/`);
  },

  // Update business logo
  updateBusinessLogo: async (businessId: string, logoFile: File): Promise<Business> => {
    const formData = new FormData();
    formData.append('logo', logoFile);
    const response = await api.put(
      `/businesses/businesses/${businessId}/update_logo/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Update business cover image
  updateBusinessCover: async (businessId: string, coverFile: File): Promise<Business> => {
    const formData = new FormData();
    formData.append('cover_image', coverFile);
    const response = await api.put(
      `/businesses/businesses/${businessId}/update_cover/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Remove business logo
  removeBusinessLogo: async (businessId: string): Promise<Business> => {
    const response = await api.delete(`/businesses/businesses/${businessId}/remove_logo/`);
    return response.data;
  },

  // Remove business cover image
  removeBusinessCover: async (businessId: string): Promise<Business> => {
    const response = await api.delete(`/businesses/businesses/${businessId}/remove_cover/`);
    return response.data;
  }
};
