'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { dashboardService, type DashboardData, type TimeFilter } from '@/services/dashboardService';
import { FiUsers, FiDollarSign, FiTrendingDown, FiCheckCircle, FiRefreshCw, FiTarget } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { formatNumber } from '../../../../../../../src/utils/format';

// Time filter interface is now imported from dashboardService

interface Subtitle {
  text: string;
  value: string | number;
}

interface Metric {
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

interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  revenue: number;
  growth: number;
}

interface MemberActivity {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
  lastActive: string;
}

interface Metric {
  title: string;
  value: string | number;
  icon?: IconType;
  trend?: 'up' | 'down' | 'neutral';
  change?: number;
  subtitles?: Array<{
    text: string;
    value: string | number;
  }>;
}

// Dashboard data interface is now imported from dashboardService
interface ChartProps {
  data: Record<string, unknown>[];
  type: 'line' | 'donut';
  title: string;
  xKey?: string;
  yKey?: string;
  nameKey?: string;
  valueKey?: string;
}

// Chart components
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ChartProps {
  data: Record<string, unknown>[];
  type: 'line' | 'donut';
  title: string;
  xKey?: string;
  yKey?: string;
  nameKey?: string;
  valueKey?: string;
}

const Chart: React.FC<ChartProps> = ({ data, type, title, xKey, yKey, nameKey, valueKey }) => {
  if (type === 'line') {
    return (
      <ReactApexChart
        options={{
          chart: { type: 'line', toolbar: { show: false } },
          xaxis: { type: 'category' },
          stroke: { curve: 'smooth' },
          title: { text: title, style: { fontSize: '14px' } }
        }}
        series={[{
          name: title,
          data: data.map(d => ({
            x: d[xKey || 'x'] as string | number,
            y: d[yKey || 'y'] as number
          }))
        }]}
        type="line"
        height={200}
      />
    );
  }

  if (type === 'donut') {
    return (
      <ReactApexChart
        options={{
          chart: { type: 'donut' },
          labels: data.map(d => String(d[nameKey || 'name'])),
          legend: { position: 'bottom' },
          title: { text: title, style: { fontSize: '14px' } },
          plotOptions: {
            pie: {
              donut: {
                size: '65%',
                background: 'transparent'
              }
            }
          },
          dataLabels: { enabled: false }
        }}
        series={data.map(d => Number(d[valueKey || 'value']))}
        type="donut"
        height={200}
      />
    );
  }

  return null;
};

// Dashboard component
function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const merchantId = params?.merchantId as string;
  const businessId = params?.businessId as string;
  const { showNotification } = useNotification();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>({ filterType: 'period', period: 'year' });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/signin');
        return;
      }
      const fetchDashboardData = async () => {
        try {
          setIsLoading(true);
          setError(null);
          console.log('Fetching dashboard data for businessId:', businessId);
          const data = await dashboardService.getDashboardData(businessId, timeFilter);
          console.log('Dashboard data:', data);
          setDashboardData(data);
        } catch (error: any) {
          console.error('Error fetching dashboard data:', error);
          setError(error.message || 'Failed to fetch dashboard data');
          showNotification({
            title: 'Error',
            message: error.message || 'Failed to fetch dashboard data',
            type: 'error'
          });
        } finally {
          setIsLoading(false);
        }
      };
      if (businessId) {
        fetchDashboardData();
      }
    }
  }, [timeFilter, isAuthenticated, authLoading, businessId, showNotification]);

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      setIsLoading(true);
      await dashboardService.exportDashboardData(merchantId, businessId, timeFilter, format);
      showNotification({
        title: 'Success',
        message: `Dashboard data exported as ${format.toUpperCase()}`,
        type: 'success'
      });
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message || `Failed to export dashboard as ${format.toUpperCase()}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Time Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeFilter({ filterType: 'period', period: 'year' })}
              className={`px-3 py-1 text-sm rounded-md ${timeFilter.period === 'year' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}
            >
              Year
            </button>
            <button
              onClick={() => setTimeFilter({ filterType: 'period', period: 'month' })}
              className={`px-3 py-1 text-sm rounded-md ${timeFilter.period === 'month' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeFilter({ filterType: 'period', period: 'week' })}
              className={`px-3 py-1 text-sm rounded-md ${timeFilter.period === 'week' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}
            >
              Week
            </button>
          </div>
          {/* Export Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Members Metric */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="p-4 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
                  <FiUsers className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Members</h3>
              </div>
              <span className={`flex items-center text-sm font-medium ${(dashboardData?.metrics?.members?.growthPercent ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {(dashboardData?.metrics?.members?.growthPercent ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.metrics?.members?.growthPercent ?? 0)}%
              </span>
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(dashboardData?.metrics?.members?.total ?? 0)}</h4>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.members?.active ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">New This Month</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.members?.newThisMonth ?? 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* MRR Metric */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="p-4 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
                  <FiDollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">MRR</h3>
              </div>
              <span className={`flex items-center text-sm font-medium ${(dashboardData?.metrics?.revenue?.growthPercent ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {(dashboardData?.metrics?.revenue?.growthPercent ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.metrics?.revenue?.growthPercent ?? 0)}%
              </span>
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(dashboardData?.metrics?.revenue?.mrr ?? 0)}</h4>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.revenue?.totalRevenue ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Growth</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{dashboardData?.metrics?.revenue?.growthPercent ?? 0}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metric */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="p-4 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
                  <FiTrendingDown className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Performance</h3>
              </div>
              <span className={`flex items-center text-sm font-medium ${(dashboardData?.metrics?.performance?.growthPercent ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {(dashboardData?.metrics?.performance?.growthPercent ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.metrics?.performance?.growthPercent ?? 0)}%
              </span>
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.metrics?.performance?.performancePercent ?? 0}%</h4>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Churn Rate</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{dashboardData?.metrics?.performance?.churnRate ?? 0}%</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">ARPU</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.performance?.arpu ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Growth</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{dashboardData?.metrics?.performance?.growthPercent ?? 0}%</p>
              </div>
            </div>
          </div>
        </div>
        {/* Subscriptions Metric */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="p-4 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
                  <FiCheckCircle className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Subscriptions</h3>
              </div>
              <span className={`flex items-center text-sm font-medium ${(dashboardData?.metrics?.subscriptions?.growthPercent ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {(dashboardData?.metrics?.subscriptions?.growthPercent ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.metrics?.subscriptions?.growthPercent ?? 0)}%
              </span>
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(dashboardData?.metrics?.subscriptions?.total ?? 0)}</h4>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.subscriptions?.active ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Trial</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.subscriptions?.trial ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Growth</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{dashboardData?.metrics?.subscriptions?.growthPercent ?? 0}%</p>
              </div>
            </div>
          </div>
        </div>
        {/* Renewals Metric */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="p-4 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
                  <FiRefreshCw className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Renewals</h3>
              </div>
              <span className={`flex items-center text-sm font-medium ${(dashboardData?.metrics?.renewals?.growthRate ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {(dashboardData?.metrics?.renewals?.growthRate ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.metrics?.renewals?.growthRate ?? 0)}%
              </span>
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(dashboardData?.metrics?.renewals?.total ?? 0)}</h4>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">This Month</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.renewals?.thisMonth ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Next Month</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.renewals?.nextMonth ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Growth Rate</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{dashboardData?.metrics?.renewals?.growthRate ?? 0}%</p>
              </div>
            </div>
          </div>
        </div>
        {/* Campaigns Metric */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="p-4 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
                  <FiTarget className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Campaigns</h3>
              </div>
              <span className={`flex items-center text-sm font-medium ${(dashboardData?.metrics?.campaigns?.growthPercent ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {(dashboardData?.metrics?.campaigns?.growthPercent ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.metrics?.campaigns?.growthPercent ?? 0)}%
              </span>
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(dashboardData?.metrics?.campaigns?.total ?? 0)}</h4>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.campaigns?.active ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Draft</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.campaigns?.draft ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Growth</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{dashboardData?.metrics?.campaigns?.growthPercent ?? 0}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Subscription Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <Chart
            data={dashboardData?.metrics.analytics.subscriptionTrends || []}
            type="line"
            title="Subscription Trends"
            xKey="date"
            yKey="value"
          />
        </div>

        {/* Plan Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <Chart
            data={dashboardData?.metrics.analytics.planDistribution || []}
            type="donut"
            title="Plan Distribution"
            nameKey="name"
            valueKey="value"
          />
        </div>
      </div>

      {/* Recent Members */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mt-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
            <FiUsers className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Members</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Member</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {dashboardData?.recentMembers?.map((member: MemberActivity) => (
                <tr key={member.id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{member.plan}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === 'active' ? 'bg-green-100 text-green-800' : member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
