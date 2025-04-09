import { MembershipRequest, MembershipRequestFilter, MembershipRequestStatus } from '../types/membershipRequest';
import { api } from '../utils/api';

export class MembershipRequestService {
  private static readonly BASE_URL = '/api/subscriptions';

  async getRequests(businessId: number, filter: MembershipRequestFilter = {}): Promise<MembershipRequest[]> {
    try {
      const response = await api.get(`${MembershipRequestService.BASE_URL}/businesses/${businessId}/membership-requests-made/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching membership requests:', error);
      throw error;
    }
  }

  async createRequest(businessId: number, role: string, message: string): Promise<MembershipRequest> {
    try {
      const response = await api.post(`${MembershipRequestService.BASE_URL}/businesses/${businessId}/membership-requests-made/`, {
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

  async updateRequest(businessId: number, requestId: number, status: MembershipRequestStatus): Promise<MembershipRequest> {
    try {
      const response = await api.patch(`${MembershipRequestService.BASE_URL}/businesses/${businessId}/membership-requests-made/${requestId}/`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }

  async deleteRequest(businessId: number, requestId: number): Promise<void> {
    try {
      await api.delete(`${MembershipRequestService.BASE_URL}/businesses/${businessId}/membership-requests-made/${requestId}/`);
    } catch (error) {
      console.error('Error deleting request:', error);
      throw error;
    }
  }

  async getMyRequests(businessId: number): Promise<MembershipRequest[]> {
    try {
      const response = await api.get(`${MembershipRequestService.BASE_URL}/businesses/${businessId}/membership-requests-made/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my requests:', error);
      throw error;
    }
  }

  async getReceivedRequests(businessId: number): Promise<MembershipRequest[]> {
    try {
      const response = await api.get(`${MembershipRequestService.BASE_URL}/businesses/${businessId}/membership-requests-received/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching received requests:', error);
      throw error;
    }
  }
}
