export interface AffiliateParticipant {
  id: number;
  username: string;
  phone: string;
  created_at: string;
  updated_at: string;
  campaign_id: number;
}

export interface CampaignActivity {
  id: number;
  participant_id: number;
  campaign_id: number;
  type: 'PAGE_VISIT' | 'CALL_CLICK' | 'SOCIAL_CLICK';
  points: number;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface CampaignReward {
  id: number;
  participant_id: number;
  campaign_id: number;
  points: number;
  status: 'PENDING' | 'APPROVED' | 'PAID';
  created_at: string;
  updated_at: string;
}
