import { AffiliateParticipant } from "./affiliate";

export interface Campaign {
  id: number;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'DRAFT';
  point_value: number;
  business_id: number;
  created_at: string;
  updated_at: string;
  participants?: AffiliateParticipant[];
}
