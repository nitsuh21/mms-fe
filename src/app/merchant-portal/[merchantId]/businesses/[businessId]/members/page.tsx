'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import { Customer, CreateCustomerData } from '@/services/customerService';
import { customerService } from '@/services/customerService';
import Link from 'next/link';

interface AddMemberFormData extends CreateCustomerData {
  is_active?: boolean;
}

export default function MembersPage() {
  const params = useParams();
  const businessId = params?.businessId as string;
  const [members, setMembers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState<AddMemberFormData>({
    business: businessId ? Number(businessId) : 0,
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotification();

  const loadMembers = async () => {
    if (!businessId) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Business ID is missing.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await customerService.getCustomers(businessId);
      setMembers(response);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load members:", error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load members. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const handleAddMember = async (data: AddMemberFormData) => {
    try {
      const response = await customerService.createCustomer(data);
      setMembers([...members, response]);
      setShowAddMember(false);
      addNotification({
        type: 'success',
        title: 'Member Added',
        message: 'New member has been successfully added. A sync request has been created.',
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

  useEffect(() => {
    if (businessId) {
      loadMembers();
    }
  }, [businessId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <div className="flex space-x-4">
          <Link
            href={`/merchant-portal/${params?.merchantId}/businesses/${businessId}/membership-requests`}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          >
            View Membership Requests
          </Link>
          <button
            onClick={() => setShowAddMember(true)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Add New Member
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Members</h2>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Phone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {members?.length > 0 ? (
                members.filter(member => 
                  member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  member.phone.includes(searchTerm)
                ).map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.first_name} {member.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{member.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{member.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleUpdateMember(member.id, {
                          is_active: !member.is_active
                        })}
                        className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                      >
                        {member.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="ml-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full relative">
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
