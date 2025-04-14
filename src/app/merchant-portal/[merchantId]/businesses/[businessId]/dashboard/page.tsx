'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiUsers, FiPieChart, FiCreditCard, FiAlertCircle, FiBell, FiCalendar, FiBarChart2 } from 'react-icons/fi';

interface Metric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
}

interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  subscribers: number;
  revenue: number;
  growth: number;
}

interface MemberActivity {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'active' | 'pending' | 'expired';
  joinedAt: string;
  lastActive: string;
}

// Mock data
const mockMetrics: Metric[] = [
  {
    label: 'Total Revenue',
    value: '$12,345.67',
    change: 12.5,
    trend: 'up',
    icon: FiDollarSign,
    color: '#34D399'
  },
  {
    label: 'Active Members',
    value: 456,
    change: 8.2,
    trend: 'up',
    icon: FiUsers,
    color: '#34D399'
  },
  {
    label: 'New Subscriptions',
    value: 27,
    change: 15.3,
    trend: 'up',
    icon: FiTrendingUp,
    color: '#34D399'
  },
  {
    label: 'Churn Rate',
    value: '3.2%',
    change: -1.1,
    trend: 'down',
    icon: FiTrendingDown,
    color: '#EF4444'
  },
  {
    label: 'ARPU',
    value: '$27.12',
    change: 4.8,
    trend: 'up',
    icon: FiDollarSign,
    color: '#34D399'
  },
  {
    label: 'Pending Payments',
    value: '$456.78',
    change: 2,
    trend: 'neutral',
    icon: FiAlertCircle,
    color: '#FBBF24'
  }
];

const mockTopPlans: MembershipPlan[] = [
  {
    id: '1',
    name: 'Premium Plan',
    description: 'Full access to all features',
    price: 49.99,
    duration: 'monthly',
    features: ['Unlimited access', 'Priority support', 'Advanced analytics'],
    subscribers: 256,
    revenue: 12547.28,
    growth: 12.5
  },
  {
    id: '2',
    name: 'Basic Plan',
    description: 'Essential features',
    price: 19.99,
    duration: 'monthly',
    features: ['Basic access', 'Standard support'],
    subscribers: 128,
    revenue: 2537.72,
    growth: 8.2
  },
  {
    id: '3',
    name: 'Enterprise Plan',
    description: 'Custom solutions',
    price: 99.99,
    duration: 'monthly',
    features: ['Custom features', 'Dedicated support', 'Advanced analytics'],
    subscribers: 72,
    revenue: 7199.28,
    growth: 15.3
  }
];

const mockRecentMembers: MemberActivity[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    plan: 'Premium Plan',
    status: 'active',
    joinedAt: '2025-03-28',
    lastActive: '2025-04-02'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    plan: 'Basic Plan',
    status: 'active',
    joinedAt: '2025-03-29',
    lastActive: '2025-04-01'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    plan: 'Enterprise Plan',
    status: 'active',
    joinedAt: '2025-03-30',
    lastActive: '2025-04-03'
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    plan: 'Premium Plan',
    status: 'pending',
    joinedAt: '2025-03-31',
    lastActive: '2025-03-31'
  },
  {
    id: '5',
    name: 'Charlie Green',
    email: 'charlie@example.com',
    plan: 'Basic Plan',
    status: 'active',
    joinedAt: '2025-04-01',
    lastActive: '2025-04-02'
  }
];

export default function DashboardPage() {
  const params = useParams();
  const businessId = params?.businessId as string;
  const merchantId = params?.merchantId as string;

  const [metrics, setMetrics] = useState<Metric[]>(mockMetrics);
  const [topPlans, setTopPlans] = useState<MembershipPlan[]>(mockTopPlans);
  const [recentMembers, setRecentMembers] = useState<MemberActivity[]>(mockRecentMembers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification();

  useEffect(() => {
    // No need for API calls, using mock data
    setLoading(false);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat('en-US').format(number);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Overview of your business performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <metric.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  {metric.label}
                </h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {metric.value}
                </p>
                <div className="flex items-center mt-2">
                  <metric.icon
                    className={`h-5 w-5 ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}
                  />
                  <p className={`ml-2 text-sm font-medium ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                    {metric.change >= 0 ? '+' : ''}{metric.change}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Plans */}
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
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {topPlans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {plan.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ${plan.price} / {plan.duration}
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
                        {plan.growth.toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Members */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Members</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {recentMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {member.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {member.plan}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.status === 'active' ? 'bg-green-100 text-green-800' :
                        member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(member.lastActive).toLocaleDateString()}
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
