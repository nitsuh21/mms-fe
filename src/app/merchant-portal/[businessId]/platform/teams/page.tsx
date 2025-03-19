"use client";

import { useState } from 'react';
import { FiPlus, FiMail, FiTrash2, FiShield } from 'react-icons/fi';

// Mock data - replace with API calls
const teamMembers = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    role: 'Platform Admin',
    businesses: ['Fitness Studio', 'Yoga Center'],
    status: 'active',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'Business Admin',
    businesses: ['Dance Academy'],
    status: 'active',
  },
  {
    id: 3,
    name: 'Mike Wilson',
    email: 'mike@example.com',
    role: 'Business Staff',
    businesses: ['Martial Arts Dojo'],
    status: 'pending',
  },
];

const roles = [
  {
    name: 'Platform Admin',
    description: 'Full access to all businesses and platform features',
    permissions: ['Manage businesses', 'Manage users', 'View analytics', 'Configure settings'],
  },
  {
    name: 'Business Admin',
    description: 'Full access to assigned businesses',
    permissions: ['Manage members', 'View analytics', 'Configure business settings'],
  },
  {
    name: 'Business Staff',
    description: 'Limited access to assigned businesses',
    permissions: ['View members', 'Basic analytics'],
  },
];

export default function TeamsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const filteredMembers = teamMembers.filter(
    (member) =>
      (member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedRole === 'all' || member.role === selectedRole)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admins & Teams</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage team members and their roles
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-600">
          <FiPlus className="mr-2 h-4 w-4" />
          Invite Member
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search team members
          </label>
          <input
            type="search"
            id="search"
            className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sm:w-48">
          <select
            id="role"
            className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            {roles.map((role) => (
              <option key={role.name} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Member
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Businesses
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
            {filteredMembers.map((member) => (
              <tr key={member.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/50">
                        <span className="text-sm font-medium leading-none text-brand-700 dark:text-brand-400">
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <FiShield className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">{member.role}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {member.businesses.map((business) => (
                      <span
                        key={business}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {business}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      member.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                    <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                      <FiMail className="h-4 w-4" />
                      <span className="sr-only">Email</span>
                    </button>
                    <button className="text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                      <FiTrash2 className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Roles Information */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Roles & Permissions</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Understanding the different roles and their permissions
          </p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {roles.map((role) => (
            <div key={role.name} className="px-6 py-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">{role.name}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/50 dark:text-brand-400"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
