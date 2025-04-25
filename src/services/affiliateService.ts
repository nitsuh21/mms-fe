import api from './api';

export interface Campaign {
  id: number;
  business: number;
  name: string;
  description: string;
  category: 'PRODUCT' | 'SERVICE' | 'EVENT' | 'OTHER';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ENDED';
  start_date: string;
  end_date: string;
  page_visit_points: number;
  call_click_points: number;
  social_click_points: number;
  point_value: number;
  created_at: string;
  updated_at: string;
  total_participants?: number;
  total_activities?: number;
  total_rewards?: number;
}

export interface AffiliateParticipant {
  id: number;
  username: string;
  phone: string;
  affiliate_id: string;
  email: string | null;
  full_name: string;
  created_at: string;
}

export interface CampaignActivity {
  id: number;
  campaign: number;
  participant: number;
  activity_type: 'PAGE_VISIT' | 'CALL_CLICK' | 'SOCIAL_CLICK';
  points_earned: number;
  timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface CampaignReward {
  id: number;
  campaign: number;
  participant: number;
  total_points: number;
  reward_amount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

export interface LeaderboardEntry {
  participant: AffiliateParticipant;
  total_points: number;
  total_reward_amount: number;
  activities_count: number;
}

class AffiliateService {
  async getCampaigns(businessId?: string) {
    const url = businessId ? `/affiliates/campaigns/?business_id=${businessId}` : '/affiliates/campaigns/';
    const response = await api.get<any>(url);
    return response.data.results as Campaign[];
  }

  async joinCampaign(campaignId: number, data: { username: string; phone: string; email: string }) {
    const response = await api.post(`/affiliates/campaigns/${campaignId}/join/`, data);
    return response.data;
  }

  async addMarketer(campaignId: number, data: { username: string; phone: string; email: string; commission_rate: number }) {
    const response = await api.post(`/affiliates/campaigns/${campaignId}/marketers/`, data);
    return response.data;
  }

  async getCampaign(id: number) {
    const response = await api.get<Campaign>(`/affiliates/campaigns/${id}/`);
    return response.data;
  }

  async createCampaign(campaign: Partial<Campaign>) {
    const response = await api.post<Campaign>('/affiliates/campaigns/', campaign);
    return response.data;
  }

  async updateCampaign(id: number, campaign: Partial<Campaign>) {
    const response = await api.patch<Campaign>(`/affiliates/campaigns/${id}/`, campaign);
    return response.data;
  }

  async deleteCampaign(id: number) {
    await api.delete(`/affiliates/campaigns/${id}/`);
  }

  async getCampaignLeaderboard(id: number) {
    const response = await api.get<LeaderboardEntry[]>(`/affiliates/campaigns/${id}/leaderboard/`);
    return response.data;
  }

  async getParticipants() {
    const response = await api.get<AffiliateParticipant[]>('/affiliates/participants/');
    return response.data;
  }

  async createParticipant(participant: Partial<AffiliateParticipant>) {
    const response = await api.post<AffiliateParticipant>('/affiliates/participants/', participant);
    return response.data;
  }

  async getParticipantCampaigns(id: number) {
    const response = await api.get<Campaign[]>(`/affiliates/participants/${id}/campaigns/`);
    return response.data;
  }

  async getParticipantRewards(id: number) {
    const response = await api.get<CampaignReward[]>(`/affiliates/participants/${id}/rewards/`);
    return response.data;
  }

  async recordActivity(activity: Partial<CampaignActivity>) {
    const response = await api.post<CampaignActivity>('/affiliates/activities/', activity);
    return response.data;
  }

  async getRewards() {
    const response = await api.get<CampaignReward[]>('/affiliates/rewards/');
    return response.data;
  }

  async createReward(reward: Partial<CampaignReward>) {
    const response = await api.post<CampaignReward>('/affiliates/rewards/', reward);
    return response.data;
  }

  async approveReward(id: number) {
    const response = await api.post<CampaignReward>(`/affiliates/rewards/${id}/approve/`);
    return response.data;
  }

  async rejectReward(id: number) {
    const response = await api.post<CampaignReward>(`/affiliates/rewards/${id}/reject/`);
    return response.data;
  }

  async markRewardAsPaid(id: number) {
    const response = await api.post<CampaignReward>(`/affiliates/rewards/${id}/mark_as_paid/`);
    return response.data;
  }
}

export const affiliateService = new AffiliateService();
