"use client";

import { useState } from 'react';
import { FiDownload, FiFilter, FiTrendingUp, FiUsers, FiDollarSign, FiActivity } from 'react-icons/fi';

// Mock data - replace with API calls
const revenueData = [
  { month: 'Jan', revenue: 42000 },
  { month: 'Feb', revenue: 45000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 51000 },
  { month: 'May', revenue: 53000 },
  { month: 'Jun', revenue: 55000 },
];

const businessGrowth = [
  { month: 'Jan', businesses: 8 },
  { month: 'Feb', businesses: 10 },
  { month: 'Mar', businesses: 10 },
  { month: 'Apr', businesses: 11 },
  { month: 'May', revenue: 12 },
  { month: 'Jun', revenue: 12 },
];

const topBusinesses = [
  {
    name: 'Fitness Studio',
    revenue: '$12,450',
    growth: '+15%',
    members: 245,
  },
  {
    name: 'Yoga Center',
    revenue: '$9,280',
    growth: '+12%',
    members: 180,
  },
  {
    name: 'Dance Academy',
    revenue: '$7,650',
    growth: '+8%',
    members: 120,
  },
];

const metrics = [
  {
    name: 'Total Revenue',
    value: '$294,230',
    change: '+12.5%',
    trend: 'up',
    icon: FiDollarSign,
  },
  {
    name: 'Active Members',
    value: '2,340',
    change: '+8.2%',
    trend: 'up',
    icon: FiUsers,
  },
  {
    name: 'Member Growth',
    value: '180',
    change: '+5.3%',
    trend: 'up',
    icon: FiTrendingUp,
  },
  {
    name: 'Engagement Rate',
    value: '85%',
    change: '+2.1%',
    trend: 'up',
    icon: FiActivity,
  },
];

export default function PlatformReportsPage() {
  const [dateRange, setDateRange] = useState('last-6-months');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Platform Reports</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Platform-wide insights and analytics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            id="date-range"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="last-30-days">Last 30 Days</option>
            <option value="last-3-months">Last 3 Months</option>
            <option value="last-6-months">Last 6 Months</option>
            <option value="last-year">Last Year</option>
          </select>
          <button className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            <FiFilter className="mr-2 h-4 w-4" />
            Filters
          </button>
          <button className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-600">
            <FiDownload className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.name}
              className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              <dt>
                <div className="absolute rounded-md bg-brand-50 p-3 dark:bg-brand-900/50">
                  <Icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                  {metric.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{metric.value}</p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    metric.trend === 'up'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {metric.change}
                </p>
              </dd>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Revenue Trends</h3>
          <div className="mt-6 h-[300px]">
            {/* Add your preferred charting library here */}
            <div className="flex h-full items-end justify-between space-x-2">
              {revenueData.map((data) => (
                <div key={data.month} className="flex w-full flex-col items-center">
                  <div
                    className="w-full rounded-t bg-brand-500 dark:bg-brand-400"
                    style={{
                      height: `${(data.revenue / 60000) * 100}%`,
                    }}
                  />
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{data.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Business Growth Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Business Growth</h3>
          <div className="mt-6 h-[300px]">
            {/* Add your preferred charting library here */}
            <div className="flex h-full items-end justify-between space-x-2">
              {businessGrowth.map((data) => (
                <div key={data.month} className="flex w-full flex-col items-center">
                  <div
                    className="w-full rounded-t bg-green-500 dark:bg-green-400"
                    style={{
                      height: `${(data.businesses / 15) * 100}%`,
                    }}
                  />
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{data.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Businesses */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Top Performing Businesses
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Based on revenue and member growth
          </p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {topBusinesses.map((business) => (
            <div
              key={business.name}
              className="grid grid-cols-1 gap-4 px-6 py-4 sm:grid-cols-2 md:grid-cols-4"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{business.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Revenue</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{business.revenue}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Growth</p>
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">{business.growth}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Members</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{business.members}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
