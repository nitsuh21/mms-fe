import api from './api';

export interface CampaignActivity {
  id: number;
  campaign: number;
  participant: AffiliateParticipant;
  activity_type: 'PAGE_VISIT' | 'CALL_CLICK' | 'SOCIAL_CLICK' | 'WEBSITE_CLICK';
  points_earned: number;
  metadata?: Record<string, any>;
  timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface Campaign {
  id: number;
  name: string;
  description: string;
  business: number;
  category: 'PRODUCT' | 'SERVICE' | 'EVENT' | 'OTHER';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ENDED';
  start_date: string;
  end_date: string;
  points_per_birr: number;
  page_visit_points: number;
  call_click_points: number;
  social_click_points: number;
  point_value: number;
  participants?: AffiliateParticipant[];
  rewards?: CampaignReward[];
  total_participants?: number;
  total_activities?: number;
  total_rewards?: number;
  total_points?: number;
  page_visits?: number;
  call_clicks?: number;
  social_clicks?: number;
  total_rewards_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface AffiliateParticipant {
  id: number;
  username: string;
  phone: string;
  affiliate_id: string;
  email?: string;
  full_name: string;
  created_at: string;
  activities?: CampaignActivity[];
  activity_type: 'PAGE_VISIT' | 'CALL_CLICK' | 'SOCIAL_CLICK';
  points_earned: number;
  timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface CampaignReward {
  id: number;
  campaign: number;
  participant: string;
  total_points: number;
  reward_amount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

export interface LeaderboardEntry {
  participant: {
    id: number;
    username: string;
    full_name: string;
  };
  total_points: number;
  total_reward_amount: number;
  activities_count: number;
  has_active_reward: boolean;
  reward_id?: number;
  reward_status?: 'PENDING' | 'APPROVED' | 'PAID';
}

export interface Business {
  id: number;
  name: string;
  description: string;
  phone: string;
  website: string;
  address: string;
  social_media: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  business_hours: {
    weekday: string;
    saturday: string;
    sunday: string;
  };
  logo_url?: string;
  cover_image_url?: string;
}

class AffiliateService {
  async removeParticipant(participantId: number): Promise<void> {
    await api.delete(`/affiliates/participants/${participantId}/`);
  }
  async getCampaigns(businessId?: string) {
    const url = businessId ? `/affiliates/campaigns/?business_id=${businessId}` : '/affiliates/campaigns/';
    const response = await api.get<any>(url);
    return response.data.results as Campaign[];
  }

  async joinCampaign(campaignId: number, data: { username: string; phone: string; email: string }) {
    const response = await api.post(`/affiliates/campaigns/${campaignId}/join/`, data);
    return response.data;
  }

  async addMarketer(data: { username: string; phone: string; email?: string; campaign_id: number }) {
    const response = await api.post('/affiliates/participants/', data);
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
    console.log('Leaderboard:', response.data);
    return response.data;
  }

  async getParticipants() {
    const response = await api.get<AffiliateParticipant[]>('/affiliates/participants/');
    return response.data;
  }

  async createParticipant(data: { username: string; phone: string; email?: string; full_name: string; campaign_id: number }) {
    const response = await api.post<AffiliateParticipant>('/affiliates/participants/', data);
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

  async getRewards(campaignId?: number) {
    const url = campaignId ? `/affiliates/rewards/?campaign=${campaignId}` : '/affiliates/rewards/';
    const response = await api.get<{results: CampaignReward[]}>(`${url}`);
    return response.data.results;
  }

  async createReward(reward: Partial<CampaignReward>) {
    const response = await api.post<CampaignReward>('/affiliates/rewards/', reward);
    return response.data;
  }

  async approveReward(id: number) {
    const response = await api.post<CampaignReward>(`/affiliates/rewards/${id}/approve/`);
    return response.data;
  }

  async revokeReward(rewardId: number): Promise<void> {
    await api.post(`/affiliates/rewards/${rewardId}/revoke/`);
  }

  async markRewardAsPaid(id: number) {
    const response = await api.post<CampaignReward>(`/affiliates/rewards/${id}/mark_as_paid/`);
    return response.data;
  }

  async getParticipantByAffiliateId(affiliateId: string): Promise<AffiliateParticipant> {
    // Get participant by affiliate_id directly from the backend
    const response = await api.get(`/affiliates/participants/by-affiliate-id/${affiliateId}/`);
    if (!response.data) {
      throw new Error('Participant not found');
    }
    return response.data;
  }

  async createActivity(data: {
    affiliate_id: string;
    activity_type: CampaignActivity['activity_type'];
    metadata?: Record<string, any>;
  }): Promise<CampaignActivity> {
    // First get the participant info from affiliate ID
    const participant = await this.getParticipantByAffiliateId(data.affiliate_id);
    
    // Get the active campaign for this participant
    const campaigns = await this.getParticipantCampaigns(participant.id);
    const activeCampaign = campaigns.find(c => c.status === 'ACTIVE');
    
    if (!activeCampaign) {
      throw new Error('No active campaign found for this participant');
    }

    // Create activity with participant and campaign info
    const response = await api.post('/affiliates/activities/', {
      participant: participant.id,
      campaign: activeCampaign.id,
      activity_type: data.activity_type,
      metadata: data.metadata
    });
    return response.data;
  }

  async getBusinessByAffiliateId(affiliateId: string): Promise<Business> {
    try {
      const response = await api.get(`/affiliates/participants/${affiliateId}/business/`);
      console.log('Business response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching business:', error);
      throw error;
    }
  }

  async getCampaignActivities(campaignId: number): Promise<CampaignActivity[]> {
    const response = await api.get<{results: CampaignActivity[]}>(`/affiliates/activities/?campaign=${campaignId}`);
    console.log('Activities response:', response.data); // Debug log
    if (!response.data.results) {
      console.warn('No results found in activities response');
      return [];
    }
    return response.data.results;
  }
}

export const affiliateService = new AffiliateService();
