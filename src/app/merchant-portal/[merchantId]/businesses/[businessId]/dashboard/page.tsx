"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiUsers, FiPieChart, FiCreditCard, FiAlertCircle, FiBell } from 'react-icons/fi';
import { platformService } from '@/services/platformService';

interface Metric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
}

interface MembershipPlan {
  name: string;
  subscribers: number;
  revenue: number;
  growth: number;
}

interface MemberActivity {
  name: string;
  joinDate: string;
  plan: string;
  status: 'active' | 'pending' | 'expired';
}

export default function DashboardPage() {
  const params = useParams();
  const businessId = params?.businessId as string;
  const merchantId = params?.merchantId as string;

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [topPlans, setTopPlans] = useState<MembershipPlan[]>([]);
  const [recentMembers, setRecentMembers] = useState<MemberActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard metrics
        const report = await platformService.getReport(businessId);
        
        // Fetch membership plans
        const plans = await platformService.getMembershipPlans(businessId);
        
        // Fetch recent member activities
        const activities = await platformService.getMemberActivities(businessId);

        // Update state
        setMetrics([
          {
            label: 'Total Revenue',
            value: `$${report.totalRevenue.toFixed(2)}`,
            change: report.revenueChange,
            trend: report.revenueChange >= 0 ? 'up' : 'down',
            icon: FiDollarSign,
            color: report.revenueChange >= 0 ? '#34D399' : '#EF4444'
          },
          {
            label: 'Active Members',
            value: report.activeMembers,
            change: report.memberChange,
            trend: report.memberChange >= 0 ? 'up' : 'down',
            icon: FiUsers,
            color: report.memberChange >= 0 ? '#34D399' : '#EF4444'
          },
          {
            label: 'New Subscriptions',
            value: report.newSubscriptions,
            change: report.subscriptionChange,
            trend: report.subscriptionChange >= 0 ? 'up' : 'down',
            icon: FiTrendingUp,
            color: report.subscriptionChange >= 0 ? '#34D399' : '#EF4444'
          },
          {
            label: 'Churned Members',
            value: report.churnedMembers,
            change: report.churnChange,
            trend: 'down',
            icon: FiTrendingDown,
            color: '#EF4444'
          },
          {
            label: 'ARPU',
            value: `$${report.arpu.toFixed(2)}`,
            change: report.arpuChange,
            trend: report.arpuChange >= 0 ? 'up' : 'down',
            icon: FiDollarSign,
            color: report.arpuChange >= 0 ? '#34D399' : '#EF4444'
          },
          {
            label: 'Pending Payments',
            value: `$${report.pendingPayments.toFixed(2)}`,
            change: report.paymentIssues,
            trend: 'neutral',
            icon: FiAlertCircle,
            color: '#FBBF24'
          }
        ]);

        setTopPlans(plans);
        setRecentMembers(activities);
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
        setError(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [businessId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Membership Dashboard</h1>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700">
            <FiBell className="h-4 w-4" />
            View Notifications
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white dark:bg-dark-card rounded-lg p-6 shadow-sm dark:shadow-dark-card">
            <div className="flex items-center gap-2 mb-4">
              <metric.icon className="h-6 w-6 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.label}</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
              <span className={`text-sm font-medium ${metric.color}`}>
                {metric.trend === 'up' ? '🔼' : metric.trend === 'down' ? '🔽' : '➡️'}
                {metric.change}% vs previous period
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performing Plans */}
      <div className="bg-white dark:bg-dark-card rounded-lg p-6 shadow-sm dark:shadow-dark-card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Top Performing Plans</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-border">
                <th className="py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Plan Name</th>
                <th className="py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Subscribers</th>
                <th className="py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</th>
                <th className="py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Growth</th>
              </tr>
            </thead>
            <tbody>
              {topPlans.map((plan) => (
                <tr key={plan.name} className="border-b border-gray-200 dark:border-dark-border">
                  <td className="py-4 text-sm text-gray-900 dark:text-white">{plan.name}</td>
                  <td className="py-4 text-sm text-gray-900 dark:text-white">{plan.subscribers}</td>
                  <td className="py-4 text-sm text-gray-900 dark:text-white">${plan.revenue.toFixed(2)}</td>
                  <td className="py-4 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      plan.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {plan.growth >= 0 ? '🔼' : '🔽'} {Math.abs(plan.growth)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-card rounded-lg p-6 shadow-sm dark:shadow-dark-card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Member Signups</h2>
          <div className="space-y-4">
            {recentMembers.map((member) => (
              <div key={member.name} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Joined: {member.joinDate}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Plan: {member.plan}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  member.status === 'active' ? 'bg-green-100 text-green-800' :
                  member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </span>
              </div>
            ))}
            <button className="mt-4 text-sm text-brand-600 hover:text-brand-500">View All Members</button>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-lg p-6 shadow-sm dark:shadow-dark-card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Expiring Soon Members</h2>
          <div className="space-y-4">
            {recentMembers
              .filter(member => member.status === 'active')
              .map((member) => (
                <div key={member.name} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Membership expires in 7 days</p>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700">
                    Send Reminder
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white dark:bg-dark-card rounded-lg p-6 shadow-sm dark:shadow-dark-card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700">
            <FiUsers className="h-4 w-4" />
            Add New Member
          </button>
          <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <FiPieChart className="h-4 w-4" />
            Create New Plan
          </button>
          <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700">
            <FiBell className="h-4 w-4" />
            Send Bulk Notification
          </button>
          <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
            <FiCreditCard className="h-4 w-4" />
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}
