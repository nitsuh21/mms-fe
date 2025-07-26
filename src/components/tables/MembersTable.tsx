'use client'

import { Customer } from '@/services/customerService';
import { useState, useMemo } from 'react';
import { ArrowUpIcon, ArrowDownIcon, ArrowsUpDownIcon, MagnifyingGlassIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import Alert from '@/components/common/Alert';
import UpdateMemberForm from '@/components/form/UpdateMemberForm';
import BulkActions from '@/components/common/BulkActions';
import TableCheckbox from '@/components/common/TableCheckbox';

interface MembersTableProps {
  members: Customer[];
  searchTerm: string;
  businessId: string;
  onUpdateMember: (memberId: number, data: any) => void;
  onDeleteMember: (memberId: number) => void;
  onToggleActiveStatus: (memberId: number, isActive: boolean) => void;
}

type SortDirection = 'asc' | 'desc';
type SortableField = keyof Pick<Customer, 'first_name' | 'last_name' | 'email' | 'phone' | 'customer_id' | 'is_active'>;

export default function MembersTable({
  members,
  searchTerm,
  businessId,
  onUpdateMember,
  onDeleteMember,
  onToggleActiveStatus,
}: MembersTableProps) {
  const [sortConfig, setSortConfig] = useState<{ field: SortableField; direction: SortDirection }>({
    field: 'first_name',
    direction: 'asc'
  });

  // Alert states
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showStatusAlert, setShowStatusAlert] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Customer | null>(null);
  
  // Bulk selection states
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const sortedMembers = useMemo(() => {
    const sortableMembers = [...members];
    if (sortConfig.field) {
      sortableMembers.sort((a, b) => {
        const aValue = a[sortConfig.field] ?? '';
        const bValue = b[sortConfig.field] ?? '';

        if (sortConfig.field === 'is_active') {
          return sortConfig.direction === 'asc' 
            ? (a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1)
            : (a.is_active === b.is_active ? 0 : a.is_active ? 1 : -1);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableMembers;
  }, [members, sortConfig]);

  const requestSort = (field: SortableField) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ field, direction });
  };

  const getSortIcon = (field: SortableField) => {
    if (sortConfig.field !== field) {
      return <ArrowsUpDownIcon className="ml-1 h-3 w-3 inline-block" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUpIcon className="ml-1 h-3 w-3 inline-block" /> 
      : <ArrowDownIcon className="ml-1 h-3 w-3 inline-block" />;
  };

  const filteredMembers = useMemo(() => {
    return sortedMembers.filter(member => {
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
    });
  }, [sortedMembers, searchTerm]);

  const handleStatusChangeClick = (member: Customer) => {
    setSelectedMember(member);
    setShowStatusAlert(true);
  };

  const handleUpdateClick = (member: Customer) => {
    setSelectedMember(member);
    setShowUpdateForm(true);
  };

  const handleDeleteClick = (member: Customer) => {
    setSelectedMember(member);
    setShowDeleteAlert(true);
  };

  const confirmStatusChange = () => {
    if (selectedMember) {
      onToggleActiveStatus(selectedMember.id, !selectedMember.is_active);
      setShowStatusAlert(false);
    }
  };

  const confirmDelete = () => {
    if (selectedMember?.id) {
      onDeleteMember(selectedMember.id);
      setShowDeleteAlert(false);
    }
  };

  const handleUpdateSubmit = (data: any) => {
    if (selectedMember) {
      onUpdateMember(selectedMember.id, data);
      setShowUpdateForm(false);
    }
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredMembers.map(member => member.id);
      setSelectedMembers(new Set(allIds));
    } else {
      setSelectedMembers(new Set());
    }
  };

  const handleSelectMember = (memberId: number, checked: boolean) => {
    const newSelected = new Set(selectedMembers);
    if (checked) {
      newSelected.add(memberId);
    } else {
      newSelected.delete(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      // Delete all selected members
      for (const memberId of selectedMembers) {
        await onDeleteMember(memberId);
      }
      setSelectedMembers(new Set());
    } catch (error) {
      console.error('Bulk delete failed:', error);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedMembers(new Set());
  };

  return (
    <>
      {/* Bulk Actions */}
      <BulkActions
        selectedItems={Array.from(selectedMembers).map(id => id.toString())}
        onDeleteSelected={handleBulkDelete}
        onClearSelection={handleClearSelection}
        itemName="members"
        isLoading={isBulkDeleting}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  <TableCheckbox
                    checked={filteredMembers.length > 0 && selectedMembers.size === filteredMembers.length}
                    onChange={handleSelectAll}
                    className="ml-2"
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => requestSort('customer_id')}
                >
                  <div className="flex items-center">
                    Customer ID
                    {getSortIcon('customer_id')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => requestSort('first_name')}
                >
                  <div className="flex items-center">
                    Name
                    {getSortIcon('first_name')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => requestSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    {getSortIcon('email')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => requestSort('phone')}
                >
                  <div className="flex items-center">
                    Phone
                    {getSortIcon('phone')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => requestSort('is_active')}
                >
                  <div className="flex items-center">
                    Status
                    {getSortIcon('is_active')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member, index) => {
                  const key = member?.id || `member-${index}`;
                  return (
                    <tr 
                      key={key} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      <td className="px-4 py-4">
                        <TableCheckbox
                          checked={selectedMembers.has(member.id)}
                          onChange={(checked) => handleSelectMember(member.id, checked)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-300">
                            {member?.customer_id?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {member?.customer_id || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {member?.first_name || ''} {member?.last_name || ''}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <a 
                            href={`mailto:${member?.email}`} 
                            className="hover:text-brand-600 dark:hover:text-brand-400 hover:underline truncate max-w-[180px] inline-block"
                          >
                            {member?.email || 'N/A'}
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <a 
                            href={`tel:${member?.phone}`} 
                            className="hover:text-brand-600 dark:hover:text-brand-400 hover:underline"
                          >
                            {member?.phone || 'N/A'}
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member?.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {member?.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleUpdateClick(member)}
                            className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 text-sm font-medium inline-flex items-center"
                          >
                            <PencilSquareIcon className="h-3.5 w-3.5 mr-1.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleStatusChangeClick(member)}
                            className={`px-2.5 py-1 rounded-md text-sm font-medium inline-flex items-center ${
                              member?.is_active
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800'
                                : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                            }`}
                          >
                            {member?.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(member)}
                            className="px-2.5 py-1 rounded-md bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        No members found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'Try adjusting your search' : 'Add a new member to get started'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Alert */}
      <Alert
        isOpen={showDeleteAlert}
        title="Delete Member"
        message={`Are you sure you want to delete ${selectedMember?.first_name} ${selectedMember?.last_name}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteAlert(false)}
      />

      {/* Status Change Alert */}
      <Alert
        isOpen={showStatusAlert}
        title={selectedMember?.is_active ? 'Deactivate Member' : 'Activate Member'}
        message={`Are you sure you want to ${selectedMember?.is_active ? 'deactivate' : 'activate'} ${selectedMember?.first_name} ${selectedMember?.last_name}?`}
        confirmText={selectedMember?.is_active ? 'Deactivate' : 'Activate'}
        type={selectedMember?.is_active ? 'warning' : 'success'}
        onConfirm={confirmStatusChange}
        onCancel={() => setShowStatusAlert(false)}
      />

      {/* Update Member Form */}
      {selectedMember && (
        <UpdateMemberForm
          member={selectedMember}
          businessId={Number(businessId)}
          isOpen={showUpdateForm}
          onClose={() => setShowUpdateForm(false)}
          onSubmit={handleUpdateSubmit}
        />
      )}
    </>
  );
}