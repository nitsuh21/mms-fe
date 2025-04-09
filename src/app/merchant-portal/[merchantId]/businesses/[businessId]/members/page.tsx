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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Team Members
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search members..."
              className="block w-64 rounded-md border-gray-300 bg-white px-3 py-2 pr-10 text-sm placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
            />
            <svg
              className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <Link
            href={`/merchant-portal/${params?.merchantId}/businesses/${businessId}/membership-requests`}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:bg-gray-600"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Manage Requests
          </Link>
          <button
            onClick={() => setShowAddMember(true)}
            className="inline-flex items-center rounded-md border border-transparent bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-400 dark:focus:bg-brand-400"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Member
          </button>
        </div>
      </div>

      {showAddMember && (
        <div className="fixed inset-0 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" aria-hidden="true" />
      )}

      <div className="relative">
        {showAddMember && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-gray-800">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                        Add New Member
                      </h3>
                      <div className="mt-2 space-y-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            First Name
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            value={newMember.first_name}
                            onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-700">
                  <button
                    type="button"
                    onClick={() => handleAddMember(newMember)}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-brand-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 sm:ml-3 sm:w-auto dark:bg-brand-500 dark:hover:bg-brand-400 dark:focus:bg-brand-400"
                  >
                    Add Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddMember(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 sm:mt-0 sm:w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {members
                .filter(member =>
                  member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  member.phone.includes(searchTerm)
                )
                .map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.first_name} {member.last_name}
                          </div>
                        </div>
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
                        member.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleUpdateMember(member.id, { is_active: !member.is_active })}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
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
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
