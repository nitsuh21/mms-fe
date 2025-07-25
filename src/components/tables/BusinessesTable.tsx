'use client'

import Link from "next/link";
import { useState, useMemo } from 'react';
import { FiEye, FiEdit2, FiTrash2, FiExternalLink } from "react-icons/fi";
import { ArrowUpIcon, ArrowDownIcon, ArrowsUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Alert from '@/components/common/Alert';
import { Business } from "@/types/business";

interface BusinessesTableProps {
  businesses: Business[];
  merchantId: string;
  searchTerm?: string;
  onDelete: (businessId: string) => Promise<void>;
  onToggleActiveStatus?: (businessId: string, isActive: boolean) => Promise<void>;
}

type SortDirection = 'asc' | 'desc';
type SortableField = keyof Pick<Business, 'name' | 'email' | 'address' | 'is_active' | 'website'>;

export default function BusinessesTable({
  businesses,
  merchantId,
  searchTerm = "",
  onDelete,
  onToggleActiveStatus,
}: BusinessesTableProps) {
  const [sortConfig, setSortConfig] = useState<{ field: SortableField; direction: SortDirection }>({
    field: 'name',
    direction: 'asc'
  });

  // Alert states
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showStatusAlert, setShowStatusAlert] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const sortedBusinesses = useMemo(() => {
    const sortableBusinesses = [...businesses];
    if (sortConfig.field) {
      sortableBusinesses.sort((a, b) => {
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
    return sortableBusinesses;
  }, [businesses, sortConfig]);

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

  const filteredBusinesses = useMemo(() => {
    return sortedBusinesses.filter(business => {
      return searchTerm === "" || (
        (business.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (business.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (business.address?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (business.website?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
    });
  }, [sortedBusinesses, searchTerm]);

  const handleStatusChangeClick = (business: Business) => {
    setSelectedBusiness(business);
    setShowStatusAlert(true);
  };

  const handleDeleteClick = (business: Business) => {
    setSelectedBusiness(business);
    setShowDeleteAlert(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedBusiness || !onToggleActiveStatus) return;
    
    setIsProcessing(true);
    try {
      await onToggleActiveStatus(selectedBusiness.id, !selectedBusiness.is_active);
      setShowStatusAlert(false);
    } catch (error) {
      console.error('Error changing business status:', error);
    } finally {
      setIsProcessing(false);
      setSelectedBusiness(null);
    }
  };

  const confirmDelete = async () => {
    if (!selectedBusiness) return;
    
    setIsProcessing(true);
    try {
      await onDelete(selectedBusiness.id);
      setShowDeleteAlert(false);
    } catch (error) {
      console.error('Error deleting business:', error);
    } finally {
      setIsProcessing(false);
      setSelectedBusiness(null);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center">
                    Business Name
                    {getSortIcon('name')}
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
                  onClick={() => requestSort('address')}
                >
                  <div className="flex items-center">
                    Address
                    {getSortIcon('address')}
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
                  Members
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => requestSort('website')}
                >
                  <div className="flex items-center">
                    Website
                    {getSortIcon('website')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredBusinesses.length > 0 ? (
                filteredBusinesses.map((business) => (
                  <tr 
                    key={business.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-300">
                          {business.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {business.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {business.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <a 
                          href={`mailto:${business.email}`} 
                          className="hover:text-brand-600 dark:hover:text-brand-400 hover:underline truncate max-w-[180px] inline-block"
                        >
                          {business.email || 'N/A'}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {business.address || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        business.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {business.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        0 members
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        {business.website ? (
                          <>
                            <a
                              href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-brand-600 dark:text-brand-400 hover:underline truncate max-w-[180px] inline-block"
                            >
                              {business.website}
                            </a>
                            
                            <FiExternalLink className="ml-1 h-4 w-4 text-gray-400 dark:text-gray-500" />
                          </>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">N/A</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/merchant-portal/${merchantId}/businesses/${business.id}/dashboard`}
                          className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 text-sm font-medium inline-flex items-center"
                        >
                          {/* <FiEye className="h-3.5 w-3.5 mr-1.5" /> */}
                            View
                        </Link>
                        <Link
                          href={`/merchant-portal/${merchantId}/businesses/${business.id}/settings`}
                          className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 text-sm font-medium inline-flex items-center"
                        >
                          {/* <FiEdit2 className="h-3.5 w-3.5 mr-1.5" /> */}
                          Edit

                        </Link>
                        {onToggleActiveStatus && (
                          <button
                            onClick={() => handleStatusChangeClick(business)}
                            className={`px-2.5 py-1 rounded-md text-sm font-medium inline-flex items-center ${
                              business.is_active
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800'
                                : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                            }`}
                          >
                            {business.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(business)}
                          className="px-2.5 py-1 rounded-md bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 text-sm font-medium inline-flex items-center"
                        >
                          {/* <FiTrash2 className="h-3.5 w-3.5 mr-1.5" /> */}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        No businesses found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'Try adjusting your search' : 'Add a new business to get started'}
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
        title="Delete Business"
        message={`Are you sure you want to delete ${selectedBusiness?.name}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteAlert(false)}
        // isProcessing={isProcessing}
      />

      {/* Status Change Alert */}
      {onToggleActiveStatus && (
        <Alert
          isOpen={showStatusAlert}
          title={selectedBusiness?.is_active ? 'Deactivate Business' : 'Activate Business'}
          message={`Are you sure you want to ${selectedBusiness?.is_active ? 'deactivate' : 'activate'} ${selectedBusiness?.name}?`}
          confirmText={selectedBusiness?.is_active ? 'Deactivate' : 'Activate'}
          type={selectedBusiness?.is_active ? 'warning' : 'success'}
          onConfirm={confirmStatusChange}
          onCancel={() => setShowStatusAlert(false)}
        //   isProcessing={isProcessing}
        />
      )}
    </>
  );
}