import axios from 'axios';
import type { PlatformReport, PlatformBusinessSummary, PlatformTeamMember, MembershipPlan, MemberActivity } from '@/types/platform';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
  async getDashboard(): Promise<PlatformDashboardData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/merchants/dashboard/`);
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
  async getBusinesses(merchantId: string): Promise<PlatformBusinessSummary[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/platform/${merchantId}/businesses/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching platform businesses:', error);
      return [];
    }
  },

  // Get all team members across businesses
  async getTeamMembers(merchantId: string): Promise<PlatformTeamMember[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/platform/${merchantId}/team-members/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching platform team members:', error);
      return [];
    }
  },

  // Get platform settings
  async getSettings(merchantId: string): Promise<PlatformSettings> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/platform/${merchantId}/settings/`);
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
  async updateSettings(merchantId: string, data: Partial<PlatformSettings>): Promise<PlatformSettings> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/platform/${merchantId}/settings/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating platform settings:', error);
      throw error;
    }
  },

  // Get report for a business
  async getReport(businessId: string): Promise<PlatformReport> {
    try {
      const response = await axios.get(`${API_BASE_URL}/businesses/${businessId}/report/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report for business:', error);
      throw error;
    }
  },

  // Get membership plans for a business
  async getMembershipPlans(businessId: string): Promise<MembershipPlan[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/businesses/${businessId}/plans/`);
      return response.data.map((plan: MembershipPlan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        duration: plan.duration,
        features: plan.features,
        subscribers: plan.subscribers,
        revenue: plan.revenue,
        growth: plan.growth
      }));
    } catch (error) {
      console.error('Error fetching membership plans for business:', error);
      throw error;
    }
  },

  // Get member activities for a business
  async getMemberActivities(businessId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/businesses/${businessId}/activities/`);
      return response.data.map((activity: any) => ({
        id: activity.id,
        name: activity.name,
        email: activity.email,
        plan: activity.plan,
        status: activity.status,
        joinDate: activity.joinDate,
        expirationDate: activity.expirationDate
      }));
    } catch (error) {
      console.error('Error fetching member activities for business:', error);
      throw error;
    }
  },

  // Get all businesses
  async getAllBusinesses(): Promise<PlatformBusinessSummary[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/businesses/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all businesses:', error);
      throw error;
    }
  },

  // Get team members for a business
  async getBusinessTeamMembers(businessId: string): Promise<PlatformTeamMember[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/businesses/${businessId}/team/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team members for business:', error);
      throw error;
    }
  },

  // Get reports for a business
  async getBusinessReports(businessId: string): Promise<PlatformReport[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/businesses/${businessId}/reports/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reports for business:', error);
      throw error;
    }
  },

  // Get settings for a business
  async getBusinessSettings(businessId: string): Promise<PlatformSettings> {
    try {
      const response = await axios.get(`${API_BASE_URL}/businesses/${businessId}/settings/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching settings for business:', error);
      throw error;
    }
  },

  // Update settings for a business
  async updateBusinessSettings(businessId: string, settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    try {
      const response = await axios.put(`${API_BASE_URL}/businesses/${businessId}/settings/`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating settings for business:', error);
      throw error;
    }
  },
};

export default platformService;
