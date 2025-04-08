import { MembershipRequest, MembershipRequestFilter, MembershipRequestStatus } from '../types/membershipRequest';
import { api } from '../utils/api';

export class MembershipRequestService {
  async getRequests(filter: MembershipRequestFilter = {}): Promise<MembershipRequest[]> {
    try {
      const response = await api.get('/api/subscriptions/businesses/1/membership-requests-made/');
      return response.data;
    } catch (error) {
      console.error('Error fetching membership requests:', error);
      throw error;
    }
  }

  async createRequest(businessId: number, role: string, message: string): Promise<MembershipRequest> {
    try {
      const response = await api.post('/api/subscriptions/businesses/1/membership-requests-made/', {
        business_id: businessId,
        role,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error creating membership request:', error);
      throw error;
    }
  }

  async updateRequest(requestId: number, status: MembershipRequestStatus): Promise<MembershipRequest> {
    try {
      const response = await api.patch(`/api/subscriptions/businesses/1/membership-requests-made/${requestId}/`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }

  async deleteRequest(requestId: number): Promise<void> {
    try {
      await api.delete(`/api/subscriptions/businesses/1/membership-requests-made/${requestId}/`);
    } catch (error) {
      console.error('Error deleting request:', error);
      throw error;
    }
  }

  async getMyRequests(): Promise<MembershipRequest[]> {
    try {
      const response = await api.get('/api/subscriptions/businesses/1/membership-requests-made/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my requests:', error);
      throw error;
    }
  }

  async getReceivedRequests(businessId: number): Promise<MembershipRequest[]> {
    try {
      const response = await api.get(`/api/subscriptions/businesses/${businessId}/membership-requests-received/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching received requests:', error);
      throw error;
    }
  }
}
