import api from './api';
import { IconType } from 'react-icons';
import { FiUsers, FiCreditCard, FiDollarSign, FiTrendingDown } from 'react-icons/fi';

export interface TimeFilter {
  filterType: 'period' | 'range';
  period?: 'day' | 'week' | 'month' | 'year';
  startDate?: Date;
  endDate?: Date;
}

export interface Metric {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: IconType;
  details?: Array<{ text: string; value: string; }>;
  change?: number;
  showAsPercentage?: boolean;
  subtitles?: Array<{ text: string; value: string | number; }>;
}

export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  revenue: number;
  growth: number;
}

export interface MemberActivity {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
  lastActive: string;
}

export interface DashboardData {
  metrics: {
    members: {
      total: number;
      active: number;
      newThisMonth: number;
      growthPercent: number;
    };
    subscriptions: {
      total: number;
      active: number;
      trial: number;
      growthPercent: number;
    };
    analytics: {
      subscriptionTrends: Array<{
        date: string;
        value: number;
      }>;
      planDistribution: Array<{
        name: string;
        value: number;
        percentage: number;
      }>;
    };
    revenue: {
      totalRevenue: number;
      mrr: number;
      growthPercent: number;
    };
    performance: {
      performancePercent: number;
      churnRate: number;
      arpu: number;
      growthPercent: number;
    };
    renewals: {
      total: number;
      thisMonth: number;
      nextMonth: number;
      growthRate: number;
    };
    campaigns: {
      total: number;
      active: number;
      draft: number;
      growthPercent: number;
    };
  };
  topPlans: MembershipPlan[];
  recentMembers: MemberActivity[];
}

class DashboardService {
  private static instance: DashboardService;

  private constructor() {}

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }


  public async getDashboardData(
    businessId: string,
    timeFilter: TimeFilter
  ): Promise<DashboardData> {
    try {
      // Get main dashboard data
      const response = await api.get(`/subscriptions/dashboard/${businessId}/`, {
        params: {
          filterType: timeFilter.filterType,
          startDate: timeFilter.startDate?.toISOString().split('T')[0],
          endDate: timeFilter.endDate?.toISOString().split('T')[0],
          period: timeFilter.period,
        },
      });

      // Get analytics data
      const analyticsResponse = await api.get(`/subscriptions/dashboard/${businessId}/analytics/`);

      console.log('Analytics data:', analyticsResponse.data);

      // Combine and transform the data
      const mainData = response.data;
      const analyticsData = analyticsResponse.data;

      // Transform API data into dashboard metrics
      const dashboardData: DashboardData = {
        metrics: {
          members: {
            total: mainData.total_members || 0,
            active: mainData.active_members || 0,
            newThisMonth: mainData.new_members_this_month || 0,
            growthPercent: mainData.member_growth || 0
          },
          subscriptions: {
            total: mainData.total_subscriptions || 0,
            active: mainData.active_subscriptions || 0,
            trial: mainData.trial_subscriptions || 0,
            growthPercent: mainData.subscription_growth || 0
          },
          revenue: {
            totalRevenue: mainData.total_revenue || 0,
            mrr: mainData.mrr || 0,
            growthPercent: mainData.revenue_growth || 0
          },
          analytics: {
            subscriptionTrends: analyticsData.subscriptions?.trends || [],
            planDistribution: analyticsData.subscriptions?.planDistribution || []
          },
          performance: {
            performancePercent: mainData.performance_percent || 0,
            churnRate: mainData.churn_rate || 0,
            arpu: mainData.arpu || 0,
            growthPercent: mainData.performance_growth || 0
          },
          renewals: {
            total: mainData.total_renewals || 0,
            thisMonth: mainData.this_month_renewals || 0,
            nextMonth: mainData.next_month_renewals || 0,
            growthRate: mainData.renewal_growth || 0
          },
          campaigns: {
            total: mainData.total_campaigns || 0,
            active: mainData.active_campaigns || 0,
            draft: mainData.draft_campaigns || 0,
            growthPercent: mainData.campaign_growth || 0
          }
        },
        topPlans: mainData.top_plans || [],
        recentMembers: mainData.recent_members || []
      };

      return dashboardData;
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        throw new Error('Unauthorized access. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to access this dashboard.');
      } else if (error.response?.status === 404) {
        throw new Error('Dashboard data not found for this business.');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }

  public async exportDashboardData(
    merchantId: string,
    businessId: string,
    timeFilter: TimeFilter,
    format: 'csv' | 'pdf' = 'csv'
  ): Promise<Blob> {
    try {
      const response = await api.get(
        `/subscriptions/dashboard/${businessId}/export/`,
        {
          params: {
            filterType: timeFilter.filterType,
            startDate: timeFilter.startDate?.toISOString().split('T')[0],
            endDate: timeFilter.endDate?.toISOString().split('T')[0],
            period: timeFilter.period,
            format
          },
          responseType: 'blob'
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error exporting dashboard data:', error);
      if (error.response?.status === 401) {
        throw new Error('Unauthorized access. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to export this data.');
      } else if (error.response?.status === 404) {
        throw new Error('Export data not found for this business.');
      }
      throw new Error(error.response?.data?.message || 'Failed to export dashboard data');
    }
  }
}

export const dashboardService = DashboardService.getInstance();
