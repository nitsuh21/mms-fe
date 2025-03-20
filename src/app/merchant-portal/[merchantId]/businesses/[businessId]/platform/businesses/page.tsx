"use client";

import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

// Mock data - replace with API calls
const businesses = [
  {
    id: 1,
    name: 'Fitness Studio',
    type: 'Gym & Fitness',
    location: 'New York, NY',
    members: 245,
    revenue: '$5,890',
    status: 'active',
  },
  {
    id: 2,
    name: 'Yoga Center',
    type: 'Wellness',
    location: 'Los Angeles, CA',
    members: 180,
    revenue: '$4,200',
    status: 'active',
  },
  {
    id: 3,
    name: 'Dance Academy',
    type: 'Dance & Arts',
    location: 'Chicago, IL',
    members: 120,
    revenue: '$3,450',
    status: 'active',
  },
  {
    id: 4,
    name: 'Martial Arts Dojo',
    type: 'Martial Arts',
    location: 'Houston, TX',
    members: 95,
    revenue: '$2,800',
    status: 'pending',
  },
];

export default function BusinessesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBusinesses = businesses.filter((business) =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Businesses</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage all businesses in your platform
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-600">
          <FiPlus className="mr-2 h-4 w-4" />
          Add Business
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search businesses
          </label>
          <input
            type="search"
            id="search"
            className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Businesses Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Business
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Location
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Members
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Revenue
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredBusinesses.map((business) => (
              <tr key={business.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{business.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{business.type}</div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {business.location}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {business.members}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {business.revenue}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      business.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
                    }`}
                  >
                    {business.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                    <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                      <FiEdit2 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </button>
                    <button className="text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                      <FiTrash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
