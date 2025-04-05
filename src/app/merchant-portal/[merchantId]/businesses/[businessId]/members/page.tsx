'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import { Customer, CreateCustomerData } from '@/services/customerService';
import { customerService } from '@/services/customerService';

interface AddMemberFormData extends CreateCustomerData {
  is_active?: boolean;
}

export default function MembersPage({ params }: { params: { businessId: string } }) {
  const { businessId } = params;
  const [members, setMembers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState<AddMemberFormData>({
    business: Number(businessId),
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    is_active: true
  });
  const { addNotification } = useNotification();

  const loadMembers = async () => {
    try {
      const response = await customerService.getCustomers(Number(businessId));
      setMembers(response);
    } catch (error) {
      console.error("Failed to load members:", error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load members. Please try again.',
      });
    }
  };

  useEffect(() => {
    loadMembers();
  }, [businessId]);

  const handleAddMember = async (data: AddMemberFormData) => {
    try {
      const response = await customerService.createCustomer(data);
      setMembers([...members, response]);
      setShowAddMember(false);
      addNotification({
        type: 'success',
        title: 'Member Added',
        message: 'New member has been successfully added.',
      });
    } catch (error) {
      console.error('Failed to add member:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add member. Please try again.',
      });
    }
  };

  const handleUpdateMember = async (customerId: number, data: Partial<Customer>) => {
    try {
      const response = await customerService.updateCustomer(customerId, data);
      setMembers(members.map(member => 
        member.id === customerId ? response : member
      ));
      addNotification({
        type: 'success',
        title: 'Member Updated',
        message: 'Member information has been successfully updated.',
      });
    } catch (error) {
      console.error('Failed to update member:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update member. Please try again.',
      });
    }
  };

  const handleDeleteMember = async (customerId: number) => {
    if (!confirm('Are you sure you want to delete this member?')) {
      return;
    }

    try {
      await customerService.deleteCustomer(customerId);
      setMembers(members.filter(member => member.id !== customerId));
      addNotification({
        type: 'success',
        title: 'Member Deleted',
        message: 'Member has been successfully deleted.',
      });
    } catch (error) {
      console.error('Failed to delete member:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete member. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Members</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage your business members and their subscriptions
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search members..."
            className="w-full sm:w-auto rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/70"
          />
          <button
            onClick={() => setShowAddMember(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Add Member
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
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
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.first_name} {member.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {member.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {member.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleUpdateMember(member.id, { is_active: !member.is_active })}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Toggle Status
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="ml-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Add New Member</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddMember(newMember);
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={newMember.first_name}
                    onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={newMember.last_name}
                    onChange={(e) => setNewMember({ ...newMember, last_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
