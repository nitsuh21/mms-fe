'use client'

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import { Customer, CreateCustomerData, UpdateCustomerData } from '@/services/customerService';
import { customerService } from '@/services/customerService';
import Link from 'next/link';
import MembersTable from '@/components/tables/MembersTable';
import AddMemberForm from '@/components/form/AddMemberForm';
import { useLoading } from '@/context/LoadingContext';

export interface AddMemberFormData extends CreateCustomerData {
  is_active?: boolean;
}

export default function MembersPage() {
  const params = useParams();
  const businessId = params?.businessId as string;
  const [members, setMembers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const { isLoading, setIsLoading } = useLoading();
  const { addNotification } = useNotification();
  const [isTableLoading, setIsTableLoading] = useState(true);

  const handleAddMember = async (data: AddMemberFormData) => {
    try {
      setIsTableLoading(true);
      const response = await customerService.createCustomer(data);
      setShowAddMember(false);
      await loadMembers();
      addNotification({
        type: 'success',
        title: 'Member Added',
        message: response.message || 'New member has been added successfully.',
      });
    } catch (error) {
      console.error('Failed to add member:', error);
      addNotification({
        type: 'error',
        title: 'Error Adding Member',
        message: error instanceof Error ? error.message : 'Failed to add member. Please try again.',
      });
    } finally {
      setIsTableLoading(false);
    }
  };

  const handleUpdateMember = async (memberId: number, data: UpdateCustomerData) => {
    try {
      setIsTableLoading(true);
      await customerService.updateCustomer(memberId, data);
      await loadMembers();
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
    } finally {
      setIsTableLoading(false);
    }
  };

  const handleToggleActiveStatus = async (memberId: number, isActive: boolean) => {
    try {
      setIsTableLoading(true);
      await customerService.toggleActiveStatus({
        customerId: memberId,
        businessId: Number(businessId),
        isActive
      });
      await loadMembers();
      addNotification({
        type: 'success',
        title: isActive ? 'Member Activated' : 'Member Deactivated',
        message: `Member has been ${isActive ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      console.error(`Failed to ${isActive ? 'activate' : 'deactivate'} member:`, error);
      addNotification({
        type: 'error',
        title: `Error ${isActive ? 'Activating' : 'Deactivating'} Member`,
        message: error instanceof Error ? error.message : 
          `Failed to ${isActive ? 'activate' : 'deactivate'} member. Please try again.`,
      });
    } finally {
      setIsTableLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    try {
      setIsTableLoading(true);
      await customerService.deleteCustomer(memberId);
      await loadMembers();
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
    } finally {
      setIsTableLoading(false);
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
      setIsTableLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsTableLoading(true);
      const response = await customerService.getCustomers();
      const validMembers = response.filter(member => 
        member && typeof member === 'object' && 'id' in member
      );
      setMembers(validMembers);
    } catch (error) {
      console.error('Failed to load members:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to load members. Please try again.',
      });
      setMembers([]);
    } finally {
      setIsLoading(false);
      setIsTableLoading(false);
    }
  }, [businessId, addNotification]);

  useEffect(() => {
    if (businessId) {
      loadMembers();
    }
  }, [businessId, loadMembers]);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:gap-4">
            <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="flex gap-4">
              <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      ) : (
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
      )}

      <AddMemberForm
        businessId={Number(businessId)}
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onSubmit={handleAddMember}
      />

      <MembersTable
        members={members}
        searchTerm={searchTerm}
        businessId={businessId}
        onUpdateMember={handleUpdateMember}
        onDeleteMember={handleDeleteMember}
        onToggleActiveStatus={handleToggleActiveStatus}
        isLoading={isLoading || isTableLoading}
      />
    </div>
  );
}