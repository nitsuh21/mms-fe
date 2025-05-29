'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { dashboardService, type DashboardData, type TimeFilter } from '@/services/dashboardService';
import { FiUsers} from 'react-icons/fi';
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
          const data = await dashboardService.getDashboardData(merchantId, businessId, timeFilter);
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
      const blob = await dashboardService.exportDashboardData(merchantId, businessId, timeFilter, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      showNotification({
        title: 'Export Error',
        message: error.message || 'Failed to export dashboard data',
        type: 'error'
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-4">{error || 'No data available'}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        
        <div className="flex flex-wrap gap-2 items-center">
          {/* Time Filter */}
          <select
            value={timeFilter.period}
            onChange={(e) => setTimeFilter({ filterType: 'period', period: e.target.value as 'day' | 'week' | 'month' | 'year' })}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* First Row Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboardData?.metrics?.firstRow?.map((metric: Metric, index: number) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-4 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
                    {metric.icon && <metric.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{metric.title}</h3>
                </div>
                {metric.trend && (
                  <div className={`flex items-center text-sm ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                    {metric.change && (
                      <span>{(metric.change > 0 ? '+' : '') + metric.change.toFixed(1)}{metric.showAsPercentage ? '%' : ''}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                </div>
                {metric.subtitles && (
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    {metric.subtitles.map((subtitle, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{subtitle.text}: </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {typeof subtitle.value === 'number' ? formatNumber(subtitle.value) : subtitle.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Second Row Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {dashboardData?.metrics?.secondRow?.map((metric: Metric, index: number) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-4 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
                    {metric.icon && <metric.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />}
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{metric.title}</h3>
                </div>
                {metric.trend && (
                  <span className={`flex items-center text-sm font-medium ${metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {metric.trend === 'up' ? '↑' : '↓'} {metric.change}%
                  </span>
                )}
              </div>
              <div className="mt-3">
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</h4>
              </div>
            </div>
            {metric.subtitles && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {metric.subtitles.map((subtitle: Subtitle, idx: number) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle.text}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{subtitle.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.status === 'active' ? 'bg-green-100 text-green-800' :
                      member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
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
