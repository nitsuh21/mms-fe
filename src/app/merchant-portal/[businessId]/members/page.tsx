"use client";

import { useState } from 'react';
import { Form, InputField, SelectField, SubmitButton } from '@/components/ui/Form';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/lib/auth/rbac';
import { PERMISSIONS } from '@/lib/auth/types';
import { FiUserPlus } from 'react-icons/fi';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  subscriptionType: string;
  status: 'active' | 'expired' | 'expiring';
  nextPayment: string;
}

// Mock data - replace with API call
const mockMembers: Member[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    subscriptionType: 'Premium',
    status: 'active',
    nextPayment: '2025-04-01',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    subscriptionType: 'Basic',
    status: 'expiring',
    nextPayment: '2025-03-25',
  },
];

interface AddMemberFormData {
  name: string;
  email: string;
  phone: string;
  subscriptionType: string;
}

export default function MembersPage({ params }: { params: { businessId: string } }) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { addNotification } = useNotification();
  const { hasPermission } = useAuth();

  const filteredMembers = mockMembers.filter(member =>
    Object.values(member).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleAddMember = (data: AddMemberFormData) => {
    // Replace with API call
    console.log('Adding member:', data);
    addNotification({
      type: 'success',
      title: 'Member Added',
      message: 'New member has been successfully added.',
    });
    setShowAddMember(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Members</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage your business members and their subscriptions
          </p>
        </div>

        {hasPermission(PERMISSIONS.MANAGE_MEMBERS) && (
          <button
            onClick={() => setShowAddMember(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            <FiUserPlus className="h-4 w-4" />
            Add Member
          </button>
        )}
      </div>

      {/* Add Member Form */}
      {showAddMember && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Add New Member
          </h2>
          <Form<AddMemberFormData> onSubmit={handleAddMember} className="space-y-4">
            {(methods) => (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    name="name"
                    label="Full Name"
                    placeholder="Enter member's full name"
                    rules={{ required: 'Name is required' }}
                    methods={methods}
                  />
                  <InputField
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="Enter member's email"
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    }}
                    methods={methods}
                  />
                  <InputField
                    name="phone"
                    label="Phone"
                    type="tel"
                    placeholder="Enter member's phone"
                    methods={methods}
                  />
                  <SelectField
                    name="subscriptionType"
                    label="Subscription Type"
                    options={[
                      { value: 'basic', label: 'Basic' },
                      { value: 'premium', label: 'Premium' },
                      { value: 'family', label: 'Family' },
                    ]}
                    rules={{ required: 'Subscription type is required' }}
                    methods={methods}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddMember(false)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <SubmitButton>Add Member</SubmitButton>
                </div>
              </>
            )}
          </Form>
        </div>
      )}

      {/* Members Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Search Bar */}
        <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Subscription</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Next Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {member.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {member.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {member.phone}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {member.subscriptionType}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        member.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : member.status === 'expiring'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {member.nextPayment}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
