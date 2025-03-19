"use client";

import { useState } from 'react';
import { FiFilter, FiDownload, FiMoreVertical, FiCheck, FiX } from 'react-icons/fi';

interface Subscription {
  id: string;
  member: {
    name: string;
    email: string;
  };
  plan: {
    name: string;
    price: number;
  };
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  lastPayment: string;
  nextPayment: string;
}

// Mock data - replace with API call
const mockSubscriptions: Subscription[] = [
  {
    id: 'SUB-001',
    member: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    plan: {
      name: 'Premium Plan',
      price: 89.99,
    },
    status: 'active',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    autoRenew: true,
    lastPayment: '2025-03-01',
    nextPayment: '2025-04-01',
  },
  {
    id: 'SUB-002',
    member: {
      name: 'Sarah Smith',
      email: 'sarah@example.com',
    },
    plan: {
      name: 'Basic Plan',
      price: 29.99,
    },
    status: 'cancelled',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    autoRenew: false,
    lastPayment: '2025-03-01',
    nextPayment: '2025-04-01',
  },
];

export default function SubscriptionsPage({ params }: { params: { businessId: string } }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSubscriptions = mockSubscriptions.filter(
    (subscription) =>
      (statusFilter === 'all' || subscription.status === statusFilter) &&
      (subscription.member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subscription.member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subscription.plan.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Subscriptions</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage active subscriptions and renewals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            <FiFilter className="h-4 w-4" />
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600">
            <FiDownload className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by member name, email, or plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Auto-Renew
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Next Payment
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {subscription.member.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {subscription.member.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {subscription.plan.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ${subscription.plan.price}/mo
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        subscription.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : subscription.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : subscription.status === 'expired'
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {subscription.autoRenew ? (
                      <FiCheck className="h-5 w-5 text-green-500" />
                    ) : (
                      <FiX className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(subscription.nextPayment).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700">
                      <FiMoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No subscriptions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
