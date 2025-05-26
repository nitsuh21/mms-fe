"use client";

import { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiRefreshCw, FiUser, FiActivity } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { UserData } from '@/types/auth';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface DashboardResponse {
  total_businesses: number;
  active_businesses: number;
  inactive_businesses: number;
  total_members: number;
  active_members: number;
  inactive_members: number;
  total_customers: number;
  active_customers: number;
  inactive_customers: number;
  business_growth_rate: number;
  recent_businesses: number;
}

export default function PlatformDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [dateRange, setDateRange] = useState('30d');
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/merchants/dashboard/');
        const dashboardData : DashboardResponse = response.data;
        setDashboardData(dashboardData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/signin');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"
          >
            <FiRefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Platform Overview</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Welcome, {(user as UserData)?.first_name}! View platform-wide performance and analytics
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full sm:w-auto rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/70"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
          <button 
            onClick={handleLogout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
          >
            <FiUsers className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Business Growth */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-blue-100 rounded-full">
            <FiTrendingUp className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Business Growth</p>
        </div>
        <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {dashboardData?.total_businesses} Total
        </p>
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            {dashboardData?.business_growth_rate}% Growth
          </span>
        </div>
      </div>

      {/* Active Members */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-purple-100 rounded-full">
            <FiUsers className="h-6 w-6 text-purple-500" />
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Members</p>
        </div>
        <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {dashboardData?.active_members}
        </p>
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
            {dashboardData?.total_members} Total
          </span>
        </div>
      </div>

      {/* Active Customers */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-green-100 rounded-full">
            <FiUser className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Customers</p>
        </div>
        <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {dashboardData?.active_customers}
        </p>
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {dashboardData?.total_customers} Total
          </span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-orange-100 rounded-full">
            <FiActivity className="h-6 w-6 text-orange-500" />
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Activity</p>
        </div>
        <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {dashboardData?.recent_businesses} New Businesses
        </p>
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
            {dashboardData?.active_businesses} Active
          </span>
        </div>
      </div>
    </div>
    </div>
  );
}
