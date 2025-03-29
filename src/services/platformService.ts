import api from './api';

export interface PlatformDashboardData {
  total_business: number,
  total_memebers: number,
  total_revenue: number,
  total_customers: number,
  active_businesses: number,
  recent_businesses: number,
  business_growth_rate: number,
  last_updated: Date,
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
  }>;
}

export interface PlatformBusinessSummary {
  id: string;
  name: string;
  owner: string;
  location: string;
  status: string;
  memberCount: number;
  revenue: string;
}

export interface PlatformTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  business: string;
  lastActive: string;
}

export interface PlatformSettings {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
  defaultCurrency: string;
  dateFormat: string;
  timeZone: string;
}

export const platformService = {
  // Get platform dashboard data
  getDashboard: async (): Promise<PlatformDashboardData> => {
    try {
      const response = await api.get(`/merchants/dashboard/`);
      console.log("dashboard response", response)
      return response.data;
    } catch (error) {
      console.error('Error fetching platform dashboard data:', error);
      return {
        total_business: 0,
        total_memebers: 0,
        total_revenue: 0,
        total_customers: 0,
        active_businesses: 0,
        recent_businesses: 0,
        business_growth_rate: 0,
        last_updated: new Date(),
        recentActivity: []
      };
    }
  },

  // Get all businesses for the platform
  getBusinesses: async (merchantId: string): Promise<PlatformBusinessSummary[]> => {
    try {
      const response = await api.get(`/api/platform/${merchantId}/businesses/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching platform businesses:', error);
      return [];
    }
  },

  // Get all team members across businesses
  getTeamMembers: async (merchantId: string): Promise<PlatformTeamMember[]> => {
    try {
      const response = await api.get(`/api/platform/${merchantId}/team-members/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching platform team members:', error);
      return [];
    }
  },

  // Get platform settings
  getSettings: async (merchantId: string): Promise<PlatformSettings> => {
    try {
      const response = await api.get(`/api/platform/${merchantId}/settings/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching platform settings:', error);
      return {
        id: '1',
        name: 'Default Platform',
        email: 'contact@example.com',
        phone: '+1234567890',
        address: '123 Main St, City, Country',
        logo: '/images/logo.png',
        defaultCurrency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeZone: 'UTC'
      };
    }
  },

  // Update platform settings
  updateSettings: async (merchantId: string, data: Partial<PlatformSettings>): Promise<PlatformSettings> => {
    try {
      const response = await api.patch(`/api/platform/${merchantId}/settings/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating platform settings:', error);
      throw error;
    }
  }
};

export default platformService;
