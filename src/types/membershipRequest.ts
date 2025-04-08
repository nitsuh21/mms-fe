export type MembershipRequestStatus = 'pending' | 'approved' | 'rejected';

export type MembershipRequest = {
  id: number;
  requestor: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  business: {
    id: number;
    name: string;
  };
  status: MembershipRequestStatus;
  role: 'owner' | 'manager' | 'staff';
  message: string;
  created_at: string;
  updated_at: string;
};

export type MembershipRequestFilter = {
  status?: MembershipRequestStatus;
  role?: 'owner' | 'manager' | 'staff';
  search?: string;
};
