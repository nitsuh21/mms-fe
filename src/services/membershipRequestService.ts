import { MembershipRequest, MembershipRequestFilter, MembershipRequestStatus } from '../types/membershipRequest';
import api from './api'

export class MembershipRequestService {

  async getRequests(businessId: number): Promise<MembershipRequest[]> {
    try {
      const response = await api.get(`/subscriptions/businesses/${businessId}/membership-requests/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching membership requests:', error);
      throw error;
    }
  }

  async createRequest(businessId: number, role: string, message: string): Promise<MembershipRequest> {
    try {
      const response = await api.post(`/subscriptions/businesses/${businessId}/membership-requests/`, {
        role,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  }

  async updateRequest(businessId: number, requestId: number, status: MembershipRequestStatus): Promise<MembershipRequest> {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('No user found');
      }
      const user = JSON.parse(storedUser);
      
      const response = await api.patch(`/subscriptions/businesses/${businessId}/membership-requests/${requestId}/`, {
        status,
        business: businessId,
        user: user.id
      });
      return response.data;
    } catch (error) {
      console.error('Error updating request:', error);
      throw error;
    }
  }

  async deleteRequest(businessId: number, requestId: number): Promise<void> {
    try {
      await api.delete(`/subscriptions/businesses/${businessId}/membership-requests/${requestId}/`);
    } catch (error) {
      console.error('Error deleting request:', error);
      throw error;
    }
  }

  async getMyRequests(businessId: number): Promise<MembershipRequest[]> {
    try {
      const response = await api.get(`/subscriptions/businesses/${businessId}/membership-requests/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my requests:', error);
      throw error;
    }
  }

  async getReceivedRequests(businessId: number): Promise<MembershipRequest[]> {
    try {
      const response = await api.get(`/subscriptions/businesses/${businessId}/membership-requests-received/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching received requests:', error);
      throw error;
    }
  }
}
