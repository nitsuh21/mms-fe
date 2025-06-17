export interface PlatformReport {
  totalRevenue: number;
  revenueChange: number;
  activeMembers: number;
  memberChange: number;
  newSubscriptions: number;
  subscriptionChange: number;
  churnedMembers: number;
  churnChange: number;
  arpu: number;
  arpuChange: number;
  pendingPayments: number;
  paymentIssues: number;
}

export interface PlatformBusinessSummary {
  id: string;
  name: string;
  owner: string;
  location: string;
  memberCount: number;
  lastActive: string;
}

export interface PlatformTeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  lastActive: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  subscribers: number;
  revenue: number;
  growth: number;
}

export interface MemberActivity {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'active' | 'pending' | 'expired';
  joinDate: string;
  expirationDate: string;
}

export interface DashboardResponse {
  businesses: {
    total: number;
    active: number;
    recent: number;
    growth_rate: number;
  };
  members: {
    total: number;
    active: number;
  };
  affiliates: {
    total: number;
    active: number;
  };
  campaigns: {
    total: number;
    active: number;
  };
  subscriptions: {
    total: number;
    active: number;
    monthly_revenue: number;
  };
  last_updated: string;
}
