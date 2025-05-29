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
    firstRow: Metric[];
    secondRow: Metric[];
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

  private getTrend(value: number): 'up' | 'down' | 'neutral' {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  }

  public async getDashboardData(
    merchantId: string,
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

      // Combine and transform the data
      const mainData = response.data;
      const analyticsData = analyticsResponse.data;

      // Transform API data into dashboard metrics
      const dashboardData: DashboardData = {
        metrics: {
          firstRow: [
            {
              title: 'Total Revenue',
              value: mainData.total_revenue || 0,
              icon: FiDollarSign,
              trend: this.getTrend(mainData.revenue_growth || 0),
              change: mainData.revenue_growth || 0,
              subtitles: [
                { text: 'Monthly Recurring', value: mainData.mrr || 0 },
                { text: 'Annual Recurring', value: mainData.arr || 0 }
              ]
            },
            {
              title: 'Active Members',
              value: mainData.active_members || 0,
              icon: FiUsers,
              trend: this.getTrend(mainData.member_growth || 0),
              change: mainData.member_growth || 0,
              subtitles: [
                { text: 'New This Month', value: mainData.new_members || 0 },
                { text: 'Churn Rate', value: `${mainData.churn_rate || 0}%` }
              ]
            },
            {
              title: 'Average Revenue',
              value: mainData.average_revenue || 0,
              icon: FiCreditCard,
              trend: this.getTrend(mainData.arpu_growth || 0),
              change: mainData.arpu_growth || 0,
              subtitles: [
                { text: 'Per User', value: mainData.arpu || 0 },
                { text: 'Lifetime Value', value: mainData.ltv || 0 }
              ]
            },
            {
              title: 'Churn Rate',
              value: `${mainData.churn_rate || 0}%`,
              icon: FiTrendingDown,
              trend: this.getTrend(-(mainData.churn_rate_growth || 0)),
              change: -(mainData.churn_rate_growth || 0),
              showAsPercentage: true,
              subtitles: [
                { text: 'Lost Members', value: mainData.churned_members || 0 },
                { text: 'Revenue Lost', value: mainData.churned_revenue || 0 }
              ]
            }
          ],
          secondRow: [],
          analytics: {
            subscriptionTrends: analyticsData.subscription_trends || [],
            planDistribution: analyticsData.plan_distribution || []
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
