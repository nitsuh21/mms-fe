"use client";

import { FiUsers, FiBriefcase, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

// Mock data - replace with API calls
const stats = [
  {
    name: 'Total Businesses',
    value: '12',
    change: '+2',
    changeType: 'increase',
    icon: FiBriefcase,
  },
  {
    name: 'Total Members',
    value: '2,340',
    change: '+180',
    changeType: 'increase',
    icon: FiUsers,
  },
  {
    name: 'Monthly Revenue',
    value: '$48,290',
    change: '+12.3%',
    changeType: 'increase',
    icon: FiDollarSign,
  },
  {
    name: 'Active Subscriptions',
    value: '1,890',
    change: '+8.2%',
    changeType: 'increase',
    icon: FiTrendingUp,
  },
];

const recentBusinesses = [
  {
    id: 1,
    name: 'Fitness Studio',
    type: 'Gym & Fitness',
    members: 245,
    revenue: '$5,890',
    status: 'active',
  },
  {
    id: 2,
    name: 'Yoga Center',
    type: 'Wellness',
    members: 180,
    revenue: '$4,200',
    status: 'active',
  },
  {
    id: 3,
    name: 'Dance Academy',
    type: 'Dance & Arts',
    members: 120,
    revenue: '$3,450',
    status: 'active',
  },
];

export default function PlatformDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Platform Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Overview of all businesses and platform performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              <dt>
                <div className="absolute rounded-md bg-brand-50 p-3 dark:bg-brand-900/50">
                  <Icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    stat.changeType === 'increase'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {stat.change}
                </p>
              </dd>
            </div>
          );
        })}
      </div>

      {/* Recent Businesses */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Businesses</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            A list of the most recently added businesses
          </p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentBusinesses.map((business) => (
            <div
              key={business.id}
              className="grid grid-cols-1 gap-4 px-6 py-4 sm:grid-cols-2 md:grid-cols-4"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{business.name}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{business.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Members</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{business.members}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Monthly Revenue</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{business.revenue}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Status</p>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      business.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
                    }`}
                  >
                    {business.status}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
