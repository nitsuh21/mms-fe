"use client";

import { useState } from 'react';
import { FiDownload, FiTrendingUp, FiTrendingDown, FiDollarSign, FiUsers } from 'react-icons/fi';

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

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState('30d');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
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
        {mockMetrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.label}</p>
              {metric.trend === 'up' ? (
                <FiTrendingUp className="h-5 w-5 text-green-500" />
              ) : metric.trend === 'down' ? (
                <FiTrendingDown className="h-5 w-5 text-red-500" />
              ) : null}
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
            <div className="mt-2">
              <span
                className={`inline-flex items-center text-sm font-medium ${
                  metric.trend === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {metric.trend === 'up' ? '+' : ''}
                {metric.change}%
              </span>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">vs previous period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performing Plans */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Performing Plans
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {mockTopPlans.map((plan) => (
              <div key={plan.name}>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{plan.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {plan.subscribers} subscribers
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${plan.revenue.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {plan.percentageTotal}% of total
                    </p>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-brand-600 dark:bg-brand-500"
                    style={{ width: `${plan.percentageTotal}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Revenue Over Time</h2>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Revenue chart will be implemented here
          </p>
        </div>
      </div>

      {/* Member Activity Chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Member Activity</h2>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Member activity chart will be implemented here
          </p>
        </div>
      </div>
    </div>
  );
}
