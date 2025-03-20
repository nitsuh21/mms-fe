"use client";

import { useState } from 'react';
import { FiDownload, FiTrendingUp, FiTrendingDown, FiDollarSign, FiUsers } from 'react-icons/fi';

// Mock data for platform overview
const mockMetrics = [
  {
    label: 'Total Businesses',
    value: 12,
    change: 33.3,
    trend: 'up',
  },
  {
    label: 'Active Subscribers',
    value: 1250,
    change: 15.2,
    trend: 'up',
  },
  {
    label: 'Monthly Revenue',
    value: '$45,678.90',
    change: 22.8,
    trend: 'up',
  },
  {
    label: 'Team Members',
    value: 24,
    change: 8.1,
    trend: 'up',
  },
];

export default function PlatformDashboardPage() {
  const [dateRange, setDateRange] = useState('30d');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Platform Overview</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            View platform-wide performance and analytics
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

      {/* Platform Activity Chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Platform Activity</h2>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Platform activity chart will be implemented here
          </p>
        </div>
      </div>

      {/* Business Growth Chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Business Growth</h2>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Business growth chart will be implemented here
          </p>
        </div>
      </div>
    </div>
  );
}
