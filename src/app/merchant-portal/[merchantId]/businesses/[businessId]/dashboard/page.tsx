'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import { FiUsers, FiCreditCard, FiDollarSign, FiTrendingDown, FiCalendar, FiPieChart } from 'react-icons/fi';
import { IconType } from 'react-icons';

interface TimeFilter {
  period: 'day' | 'week' | 'month' | 'year';
  date?: Date;
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

interface DashboardData {
  metrics: {
    firstRow: Metric[];
    secondRow: Metric[];
  };
  topPlans: MembershipPlan[];
  recentMembers: MemberActivity[];
}

interface Subtitle {
  text: string;
  value: string | number;
}

interface Metric {
  change: ReactNode;
  title: string;
  value: string | number;
  trend?: string;
  icon?: IconType;
  showAsPercentage?: boolean;
  subtitles?: Subtitle[];
}

type TimeRange = 'today' | 'week' | 'month' | 'year';

// Chart components
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

// Mock data


const mockMetrics = {
  firstRow: [
    {
      title: 'Total Members',
      value: '3,456',
      trend: 'up',
      change: 2.5,
      icon: FiUsers,
      showAsPercentage: true,
      subtitles: [
        { text: 'Active', value: '2,890' },
        { text: 'New This Month', value: '120' }
      ]
    },
    {
      title: 'Subscriptions',
      value: '2,890',
      trend: 'up',
      change: 1.2,
      icon: FiCreditCard,
      showAsPercentage: true,
      subtitles: [
        { text: 'Active', value: '2,500' },
        { text: 'Trial', value: '390' }
      ]
    },
    {
      title: 'Revenue',
      value: '$145,678',
      trend: 'up',
      change: 12.5,
      icon: FiDollarSign,
      showAsPercentage: true,
      subtitles: [
        { text: 'MRR', value: '$12,500' },
        { text: 'Growth', value: '+12.5%' }
      ]
    }
  ],
  secondRow: [
    {
      title: 'Performance',
      value: '97.8%',
      trend: 'down',
      change: -0.5,
      icon: FiTrendingDown,
      showAsPercentage: true,
      subtitles: [
        { text: 'Churn', value: '2.2%' },
        { text: 'ARPU', value: '$45.67' }
      ]
    },
    {
      title: 'Renewals',
      value: '123',
      trend: 'up',
      change: 5,
      icon: FiCalendar,
      showAsPercentage: true,
      subtitles: [
        { text: 'This Week', value: '45' },
        { text: 'Next Week', value: '78' }
      ]
    },
    {
      title: 'Campaigns',
      value: '15',
      trend: 'up',
      change: 2,
      icon: FiPieChart,
      showAsPercentage: true,
      subtitles: [
        { text: 'Active', value: '8' },
        { text: 'Draft', value: '7' }
      ]
    }
  ]
};

const mockPlans: MembershipPlan[] = [
  {
    id: '1',
    name: 'Premium Plan',
    description: 'Full access to all features',
    price: 29,
    revenue: 2900,
    growth: 15.3
  },
  {
    id: '2',
    name: 'Pro Plan',
    description: 'Advanced features and support',
    price: 49,
    revenue: 4900,
    growth: 20.5
  },
  {
    id: '3',
    name: 'Enterprise Plan',
    description: 'Custom solutions for large teams',
    price: 99,
    revenue: 9900,
    growth: 22.4
  }
];

const mockMembers: MemberActivity[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    plan: 'Pro Plan',
    status: 'active',
    joinedAt: '2025-03-28',
    lastActive: '2025-04-02'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    plan: 'Basic Plan',
    status: 'pending',
    joinedAt: '2025-03-29',
    lastActive: '2025-04-01'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    plan: 'Enterprise Plan',
    status: 'inactive',
    joinedAt: '2025-03-30',
    lastActive: '2025-04-03'
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    plan: 'Pro Plan',
    status: 'active',
    joinedAt: '2025-03-31',
    lastActive: '2025-03-31'
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david@example.com',
    plan: 'Basic Plan',
    status: 'active',
    joinedAt: '2025-04-01',
    lastActive: '2025-04-02'
  }
];

export default function DashboardPage() {
  const notification = useNotification();
  const params = useParams();
  const businessId = params?.businessId as string;
  const merchantId = params?.merchantId as string;

  const [timeFilter, setTimeFilter] = useState<TimeFilter>({
    period: 'month',
  });

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    metrics: {
      firstRow: mockMetrics.firstRow,
      secondRow: mockMetrics.secondRow
    },
    topPlans: mockPlans,
    recentMembers: mockMembers
  });

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // TODO: Implement API call when platformService is ready
    setLoading(false);
  }, [timeFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat('en-US').format(number);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 p-6" data-testid="dashboard-page">
      {/* Time Range Filter */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeFilter.period}
            onChange={(e) => setTimeFilter((prev) => ({ ...prev, period: e.target.value as TimeFilter['period'] }))}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <input 
            type="month"
            value={timeFilter.date?.toISOString().slice(0, 7)}
            onChange={(e) => {
              const date = new Date(e.target.value);
              setTimeFilter((prev) => ({ ...prev, date }));
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Subscriptions Over Time */}
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 lg:col-span-2">
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
        </div>

        {/* Plan Distribution */}
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
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
        </div>
      </div>

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
