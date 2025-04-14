export type MembershipRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type MembershipRequestType = 'MEMBER';

export interface MembershipRequest {
  id: number;
  business: number;
  user: number | null;
  status: MembershipRequestStatus;
  type: MembershipRequestType;
  created_at: string;
  updated_at: string;
  customer: number;
}

export type MembershipRequestFilter = {
  status?: MembershipRequestStatus;
  role?: 'owner' | 'manager' | 'staff';
  search?: string;
};
