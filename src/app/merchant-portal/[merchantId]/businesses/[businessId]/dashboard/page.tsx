'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import api from '@/utils/api';
import { FiUsers, FiCreditCard, FiDollarSign, FiTrendingDown, FiCalendar, FiPieChart } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { formatCurrency, formatNumber } from '../../../../../../../src/utils/format';

interface TimeFilter {
  filterType: 'period' | 'range';
  period?: 'day' | 'week' | 'month' | 'year';
  startDate?: Date;
  endDate?: Date;
}


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

interface DashboardData {
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

type TimeRange = 'today' | 'week' | 'month' | 'year';

// Chart components
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ChartProps {
  data: any[];
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
            x: d[xKey || 'x'],
            y: d[yKey || 'y']
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
          labels: data.map(d => d[nameKey || 'name']),
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
        series={data.map(d => d[valueKey || 'value'])}
        type="donut"
        height={200}
      />
    );
  }

  return null;
};
const LineChart = ({ data }: { data: number[] }) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;
  const padding = range * 0.1; // Add 10% padding
  const adjustedMax = maxValue + padding;
  const adjustedMin = Math.max(0, minValue - padding);
  const adjustedRange = adjustedMax - adjustedMin;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - adjustedMin) / adjustedRange) * 100;
    return `${x},${y}`;
  });

  // Create smooth curve using cubic bezier
  const path = points.reduce((acc, point, i, points) => {
    if (i === 0) return `M ${point}`;
    
    const prev = points[i - 1].split(',').map(Number);
    const curr = point.split(',').map(Number);
    const cp1x = prev[0] + (curr[0] - prev[0]) / 3;
    const cp1y = prev[1];
    const cp2x = prev[0] + (curr[0] - prev[0]) * 2 / 3;
    const cp2y = curr[1];
    
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr[0]},${curr[1]}`;
  }, '');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${path} L 100,100 L 0,100 Z`}
        fill="url(#gradient)"
      />
      <path
        d={path}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {data.map((value, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((value - adjustedMin) / adjustedRange) * 100;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2"
            fill="#3B82F6"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
};

// Simple SVG-based pie chart component
const PieChart = ({ data }: { data: { value: number; color: string }[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {data.map((item, index) => {
        const angle = (item.value / total) * 360;
        const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
        const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
        const x2 = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
        const y2 = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
        const largeArcFlag = angle > 180 ? 1 : 0;
        const path = `
          M 50 50
          L ${x1} ${y1}
          A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}
          Z
        `;
        currentAngle += angle;
        return <path key={index} d={path} fill={item.color} />;
      })}
    </svg>
  );
};

// Dashboard component
export default function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params?.businessId as string;
  const { showNotification } = useNotification();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>({
    metrics: {
      firstRow: [],
      secondRow: [],
      analytics: {
        subscriptionTrends: [],
        planDistribution: []
      }
    },
    topPlans: [],
    recentMembers: []
  });
  const [timeFilter, setTimeFilter] = useState<TimeFilter>({ filterType: 'period', period: 'year' });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const params = new URLSearchParams();
        params.append('filterType', timeFilter.filterType);
        
        if (timeFilter.filterType === 'period' && timeFilter.period) {
          params.append('period', timeFilter.period);
        } else if (timeFilter.filterType === 'range' && timeFilter.startDate && timeFilter.endDate) {
          params.append('startDate', timeFilter.startDate.toISOString().split('T')[0]);
          params.append('endDate', timeFilter.endDate.toISOString().split('T')[0]);
        }

        const response = await api.get(`/subscriptions/dashboard/${businessId}/?${params.toString()}`);
        if (response.data.success) {
          const { metrics, topPlans, recentMembers } = response.data.data;
          
          // Transform API data into dashboard metrics
          const getTrend = (value: number): 'up' | 'down' | 'neutral' => {
            if (value > 0) return 'up';
            if (value < 0) return 'down';
            return 'neutral';
          };

          const firstRow: Metric[] = [
            {
              title: 'Members',
              value: formatNumber(metrics.members.total),
              icon: FiUsers,
              trend: getTrend(metrics.members.growthPercent),
              change: Math.abs(metrics.members.growthPercent),
              subtitles: [
                { text: 'Active', value: formatNumber(metrics.members.active) },
                { text: 'New This Month', value: formatNumber(metrics.members.newThisMonth) }
              ]
            },
            {
              title: 'Subscriptions',
              value: formatNumber(metrics.subscriptions.total),
              icon: FiCreditCard,
              trend: getTrend(metrics.subscriptions.growthPercent),
              change: Math.abs(metrics.subscriptions.growthPercent),
              subtitles: [
                { text: 'Active', value: formatNumber(metrics.subscriptions.active) },
                { text: 'Trial', value: formatNumber(metrics.subscriptions.trial) }
              ]
            },
            {
              title: 'Revenue',
              value: formatCurrency(metrics.revenue.totalRevenue),
              icon: FiDollarSign,
              trend: getTrend(metrics.revenue.growthPercent),
              change: Math.abs(metrics.revenue.growthPercent),
              subtitles: [
                { text: 'MRR', value: formatCurrency(metrics.revenue.mrr) }
              ]
            }
          ];

          const secondRow: Metric[] = [
            {
              title: 'Performance',
              value: `${metrics.performance.performancePercent.toFixed(1)}%`,
              icon: FiPieChart,
              trend: getTrend(metrics.performance.growthPercent),
              change: Math.abs(metrics.performance.growthPercent),
              subtitles: [
                { text: 'Churn Rate', value: `${metrics.performance.churnRate.toFixed(1)}%` },
                { text: 'ARPU', value: formatCurrency(metrics.performance.arpu) }
              ]
            },
            {
              title: 'Renewals',
              value: formatNumber(metrics.renewals.total),
              icon: FiCalendar,
              trend: getTrend(metrics.renewals.growthRate),
              change: Math.abs(metrics.renewals.growthRate),
              subtitles: [
                { text: 'This Month', value: formatNumber(metrics.renewals.thisMonth) },
                { text: 'Next Month', value: formatNumber(metrics.renewals.nextMonth) }
              ]
            },
            {
              title: 'Campaigns',
              value: formatNumber(metrics.campaigns.total),
              icon: FiTrendingDown,
              trend: getTrend(metrics.campaigns.growthPercent),
              change: Math.abs(metrics.campaigns.growthPercent),
              subtitles: [
                { text: 'Active', value: formatNumber(metrics.campaigns.active) },
                { text: 'Draft', value: formatNumber(metrics.campaigns.draft) }
              ]
            }
          ];

          setDashboardData({
            metrics: { 
              firstRow, 
              secondRow,
              analytics: response.data.data.metrics.analytics
            },
            topPlans,
            recentMembers
          });
        } else {
          showNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to fetch dashboard data'
        });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to fetch dashboard data'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (businessId) {
      fetchDashboardData();
    }
  }, [businessId, timeFilter.period, showNotification]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !dashboardData) {
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
    <div className="space-y-6 p-6" data-testid="dashboard-page">
      {/* Time Range Filter */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <select
            value={timeFilter.filterType}
            onChange={(e) => {
              const newFilterType = e.target.value as TimeFilter['filterType'];
              setTimeFilter(newFilterType === 'period' 
                ? { filterType: 'period', period: 'year' }
                : { filterType: 'range', startDate: new Date(), endDate: new Date() }
              );
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="period">Time Period</option>
            <option value="range">Date Range</option>
          </select>

          {timeFilter.filterType === 'period' ? (
            <select
              value={timeFilter.period}
              onChange={(e) => setTimeFilter({ ...timeFilter, period: e.target.value as TimeFilter['period'] })}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          ) : (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={timeFilter.startDate?.toISOString().split('T')[0]}
                onChange={(e) => setTimeFilter({
                  ...timeFilter,
                  startDate: new Date(e.target.value)
                })}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              />
              <span className="text-gray-500 dark:text-gray-400">to</span>
              <input
                type="date"
                value={timeFilter.endDate?.toISOString().split('T')[0]}
                onChange={(e) => setTimeFilter({
                  ...timeFilter,
                  endDate: new Date(e.target.value)
                })}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              />
            </div>
          )}
        </div>
      </div>

      {/* First Row Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboardData.metrics.firstRow.map((metric: Metric, index: number) => (
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

      {/* Second Row Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {dashboardData.metrics.secondRow.map((metric: Metric, index: number) => (
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


      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <Chart
            type="line"
            data={dashboardData.metrics.analytics.subscriptionTrends}
            title="Subscription Trends"
            xKey="date"
            yKey="value"
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <Chart
            type="donut"
            data={dashboardData.metrics.analytics.planDistribution}
            title="Plan Distribution"
            nameKey="name"
            valueKey="value"
          />
        </div>
      </div>

      {/* Charts */}
      {/* <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
      </div> */}

      {/* Subscriptions Over Time */}
        {/* <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Subscriptions Over Time</h3>
          <div className="h-80">
            <div className="h-full flex flex-col">
              <div className="flex-1 relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-sm text-gray-500 -mt-2">
                  <span>200</span>
                  <span>150</span>
                  <span>100</span>
                  <span>50</span>
                  <span>0</span>
                </div>
                <div className="absolute left-12 right-4 top-0 bottom-0">
                  <LineChart data={[30, 40, 45, 50, 49, 60, 70, 91, 125, 150, 160, 180]} />
                </div>
              </div>
              <div className="h-8 ml-12 mr-4 grid grid-cols-12 text-sm text-gray-500">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                  <div key={month} className="text-center">{month}</div>
                ))}
              </div>
            </div>
          </div>
        </div> */}

        {/* Plan Distribution */}
        {/* <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Plan Distribution</h3>
          <div className="h-80">
            <div className="relative h-full">
              <PieChart
                data={[
                  { value: 44, color: '#3B82F6' },
                  { value: 55, color: '#10B981' },
                  { value: 13, color: '#6366F1' }
                ]}
              />
              <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#3B82F6] mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Basic</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#10B981] mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Premium</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#6366F1] mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Enterprise</span>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      
      {/* Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Performing Plans */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
                <FiCreditCard className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Performing Plans</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {dashboardData.topPlans.map((plan: MembershipPlan) => (
                  <tr key={plan.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{plan.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(plan.price)}/mo</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(plan.revenue)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-500">+{plan.growth.toFixed(1)}%</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Members */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
                <FiUsers className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Members</h3>
            </div>
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
                {dashboardData.recentMembers.map((member: MemberActivity) => (
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
    </div>
  );
}
