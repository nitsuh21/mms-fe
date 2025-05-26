'use client'

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import { Customer, CreateCustomerData, UpdateCustomerData } from '@/services/customerService';
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
    customer_id: "",
    email: "",
    phone: "",
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotification();

  const handleAddMember = async (data: AddMemberFormData) => {
    try {
      const response = await customerService.createCustomer(data);
      setShowAddMember(false);
      loadMembers(); // Reload the members list
      addNotification({
        type: 'success',
        title: 'Member Added',
        message: response.message || 'New member has been added and a membership request has been created.',
      });
    } catch (error) {
      console.error('Failed to add member:', error);
      addNotification({
        type: 'error',
        title: 'Error Adding Member',
        message: error instanceof Error ? error.message : 'Failed to add member. Please try again.',
      });
    }
  };

  const handleUpdateMember = async (memberId: number, data: UpdateCustomerData) => {
    try {
      await customerService.updateCustomer(memberId, data);
      loadMembers(); // Reload the members list
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
        message: error instanceof Error ? error.message : 'Failed to update member. Please try again.',
      });
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    try {
      await customerService.deleteCustomer(memberId);
      loadMembers(); // Reload the members list
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
        message: error instanceof Error ? error.message : 'Failed to delete member. Please try again.',
      });
    }
  };

  const loadMembers = useCallback(async () => {
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
      const response = await customerService.getCustomers();
      console.log("Members response:", response);
      
      // Filter out any invalid member data
      const validMembers = response.filter(member => 
        member && typeof member === 'object' && 'id' in member
      );
      
      setMembers(validMembers);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load members:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to load members. Please try again.',
      });
      setMembers([]);
      setIsLoading(false);
    }
  }, [businessId, addNotification, customerService, setMembers, setIsLoading]);

  useEffect(() => {
    if (businessId) {
      loadMembers();
    }
  }, [businessId, loadMembers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Members
        </h1>
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search members..."
              className="w-full rounded-md border-gray-300 bg-white px-3 py-2 pr-10 text-sm placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
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
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
            <Link
              href={`/merchant-portal/${params?.merchantId}/businesses/${businessId}/membership-requests`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
              className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-md border border-transparent bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-400"
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
      </div>

      {showAddMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddMember(newMember);
              }}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-gray-800">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                        Add New Member
                      </h3>
                      <div className="mt-2 space-y-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="first_name"
                            value={newMember.first_name}
                            onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="last_name"
                            value={newMember.last_name}
                            onChange={(e) => setNewMember({ ...newMember, last_name: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Customer ID <span className="text-blue-500">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            id="customer_id"
                            name="customer_id"
                            value={newMember.customer_id}
                            onChange={(e) => setNewMember({ ...newMember, customer_id: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={newMember.email}
                            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={newMember.phone}
                            onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            required
                            pattern="[0-9+\-\s]+"
                            title="Please enter a valid phone number"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-800">
                  <button
                    type="submit"
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
              </form>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Customer ID
                </th>
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
              {members && members.length > 0 ? (
                members
                  .filter(member => {
                    // Ensure member is valid before filtering
                    const isValid = member && typeof member === 'object';
                    if (!isValid) {
                      console.log('Invalid member:', member);
                      return false;
                    }
                    return searchTerm === "" || (
                      (member.first_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                      (member.last_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                      (member.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                      (member.phone || "").includes(searchTerm)
                    );
                  })
                  .map((member, index) => {
                    // Use index as fallback key if id is missing
                    const key = member?.id || `member-${index}`;
                    return (
                      <tr key={key}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {member?.customer_id || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {member?.first_name || ''} {member?.last_name || ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{member?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{member?.phone || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            member?.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {member?.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleUpdateMember(member.id, { 
                              is_active: !member.is_active, 
                              business: Number(businessId), 
                              first_name: member?.first_name || '', 
                              last_name: member?.last_name || '', 
                              email: member?.email || '', 
                              phone: member?.phone || '' 
                            })}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            {member?.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => member?.id && handleDeleteMember(member.id)}
                            className="ml-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
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
    </div>
  );
}
