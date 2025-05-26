"use client";

import { useState } from 'react';
import { FiDownload, FiTrendingUp, FiTrendingDown, FiDollarSign, FiUsers, FiBarChart2, FiPieChart } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ReportMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

interface TopPlan {
  name: string;
  revenue: number;
  subscribers: number;
  percentageTotal: number;
}

interface TimeSeriesData {
  date: string;
  revenue: number;
  activeMembers: number;
  newSubscriptions: number;
  churnRate: number;
  arpu: number;
}

// Mock data - replace with API call
const mockMetrics: ReportMetric[] = [
  {
    label: 'Total Revenue',
    value: '$12,345.67',
    change: 12.5,
    trend: 'up',
  },
  {
    label: 'Active Members',
    value: 234,
    change: 5.2,
    trend: 'up',
  },
  {
    label: 'New Subscriptions',
    value: 45,
    change: -2.8,
    trend: 'down',
  },
  {
    label: 'Average Revenue Per User',
    value: '$52.76',
    change: 8.1,
    trend: 'up',
  },
];

const mockTopPlans: TopPlan[] = [
  {
    name: 'Premium Plan',
    revenue: 5678.90,
    subscribers: 89,
    percentageTotal: 45,
  },
  {
    name: 'Basic Plan',
    revenue: 3456.78,
    subscribers: 145,
    percentageTotal: 35,
  },
  {
    name: 'Pro Plan',
    revenue: 2345.67,
    subscribers: 34,
    percentageTotal: 20,
  },
];

// Mock time series data for different date ranges
const mockTimeSeriesData: { [key: string]: TimeSeriesData[] } = {
  '7d': Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    revenue: 1500 + Math.random() * 500,
    activeMembers: 200 + Math.floor(Math.random() * 50),
    newSubscriptions: Math.floor(Math.random() * 10),
    churnRate: 2.5 + Math.random() * 2,
    arpu: 50 + Math.random() * 10
  })),
  '30d': Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    revenue: 1200 + Math.random() * 1000,
    activeMembers: 180 + Math.floor(Math.random() * 80),
    newSubscriptions: Math.floor(Math.random() * 20),
    churnRate: 3 + Math.random() * 3,
    arpu: 45 + Math.random() * 15
  })),
  '90d': Array.from({ length: 90 }, (_, i) => ({
    date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    revenue: 1000 + Math.random() * 1500,
    activeMembers: 150 + Math.floor(Math.random() * 120),
    newSubscriptions: Math.floor(Math.random() * 30),
    churnRate: 4 + Math.random() * 4,
    arpu: 40 + Math.random() * 20
  })),
  '12m': Array.from({ length: 12 }, (_, i) => ({
    date: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    revenue: 800 + Math.random() * 2000,
    activeMembers: 100 + Math.floor(Math.random() * 150),
    newSubscriptions: Math.floor(Math.random() * 40),
    churnRate: 5 + Math.random() * 5,
    arpu: 35 + Math.random() * 25
  }))
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30d');

  // Get data for current date range
  const data = mockTimeSeriesData[dateRange];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (number: number) => {
    return new Intl.NumberFormat('en-US').format(number);
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Charts data
  const revenueData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Revenue',
        data: data.map(d => d.revenue),
        borderColor: '#3B82F6',
        tension: 0.4
      }
    ]
  };

  const membersData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Active Members',
        data: data.map(d => d.activeMembers),
        borderColor: '#10B981',
        tension: 0.4
      }
    ]
  };

  const subscriptionsData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'New Subscriptions',
        data: data.map(d => d.newSubscriptions),
        borderColor: '#F59E0B',
        tension: 0.4
      },
      {
        label: 'Churn Rate',
        data: data.map(d => d.churnRate),
        borderColor: '#EF4444',
        tension: 0.4
      }
    ]
  };

  const arpuData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'ARPU',
        data: data.map(d => d.arpu),
        borderColor: '#8B5CF6',
        tension: 0.4
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Business Reports</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            View your business performance and analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
          <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600">
            <FiDownload className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 lg:grid-cols-4">
        {mockMetrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                {metric.trend === 'up' ? <FiTrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" /> : metric.trend === 'down' ? <FiTrendingDown className="h-6 w-6 text-blue-600 dark:text-blue-400" /> : <FiDollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  {metric.label}
                </h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {metric.value}
                </p>
                <div className="flex items-center mt-2">
                  {metric.trend === 'up' ? <FiTrendingUp className={`h-5 w-5 text-green-500`} /> : metric.trend === 'down' ? <FiTrendingDown className={`h-5 w-5 text-red-500`} /> : <FiDollarSign className={`h-5 w-5 text-gray-500`} />}
                  <p className={`ml-2 text-sm font-medium ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                    {metric.change >= 0 ? '+' : ''}{metric.change}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiDollarSign className="h-5 w-5 text-blue-500" />
            Revenue Over Time
          </h2>
          <div className="h-[300px]">
            <Line options={chartOptions} data={revenueData} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiUsers className="h-5 w-5 text-blue-500" />
            Active Members
          </h2>
          <div className="h-[300px]">
            <Line options={chartOptions} data={membersData} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiBarChart2 className="h-5 w-5 text-blue-500" />
            Subscriptions & Churn
          </h2>
          <div className="h-[300px]">
            <Line options={chartOptions} data={subscriptionsData} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiPieChart className="h-5 w-5 text-blue-500" />
            ARPU Trends
          </h2>
          <div className="h-[300px]">
            <Line options={chartOptions} data={arpuData} />
          </div>
        </div>
      </div>

      {/* Top Plans Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Plans</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Subscribers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    % Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {mockTopPlans.map((plan) => (
                  <tr key={plan.name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {plan.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatNumber(plan.subscribers)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(plan.revenue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {plan.percentageTotal}%
                      </div>
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
