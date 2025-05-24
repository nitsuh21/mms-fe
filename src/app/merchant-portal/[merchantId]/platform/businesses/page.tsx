"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { FiPlus, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import { IoExpandOutline } from "react-icons/io5";

import { DeleteConfirmationModal } from "@/components/common/DeleteConfirmationModal";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { Business } from "@/types/business";
import router from "next/router";

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Business[];
}

export default function PlatformBusinessesPage() {
  const params = useParams();
  const merchantId = params?.merchantId as string;
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await api.get<PaginatedResponse>(`/businesses/businesses/`);
        setBusinesses(response.data.results);
        setError(null);
      } catch (err) {
        console.error('Error fetching businesses:', err);
        setError('Failed to fetch businesses');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const handleDelete = async () => {
    if (!selectedBusiness) return;
    setIsDeleting(true);

    try {
      await api.delete(`/businesses/businesses/${selectedBusiness.id}/`);
      setBusinesses(businesses.filter(b => b.id !== selectedBusiness.id));
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting business:', err);
    } finally {
      setIsDeleting(false);
      setSelectedBusiness(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"
          >
            <FiEdit2 className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!merchantId) {
    return null;
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Platform Businesses</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage all businesses across your platform
          </p>
        </div>

        <Link
          href={`/merchant-portal/${merchantId}/platform/businesses/new`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          <FiPlus className="h-4 w-4" />
          Add Business
        </Link>
      </div>

      {/* Desktop view - table */}
      <div className="hidden md:block rounded-lg border border-gray-200 bg-white shadow-default dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
        <div className="grid grid-cols-12 border-b border-gray-200 py-4 px-6 dark:border-gray-700">
          <div className="col-span-3">
            <h5 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Business Name</h5>
          </div>
          <div className="col-span-2">
            <h5 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Owner</h5>
          </div>
          <div className="col-span-2">
            <h5 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Location</h5>
          </div>
          <div className="col-span-1">
            <h5 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</h5>
          </div>
          <div className="col-span-2">
            <h5 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Members</h5>
          </div>
          <div className="col-span-2 text-right">
            <h5 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</h5>
          </div>
        </div>

        {businesses.map((business) => (
          <div
            key={business.id}
            className="grid grid-cols-12 border-b border-gray-200 py-4 px-6 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <div className="col-span-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">{business.name}</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{business.email}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">{business.owner?.name || 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">{business.location || 'N/A'}</p>
            </div>
            <div className="col-span-1">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${business.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}
              >
                {business.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">0 members</p>
            </div>
            <div className="col-span-2 text-right">
              <div className="flex items-center justify-end space-x-2">
                <Link
                  href={`/merchant-portal/${merchantId}/businesses/${business.id}/dashboard`}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  title="View details"
                >
                  <IoExpandOutline className="h-4 w-4" />
                </Link>
                <Link
                  href={`/merchant-portal/${merchantId}/platform/businesses/${business.id}/edit`}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  title="Expand In"
                >
                  <FiEdit2 className="h-4 w-4" />
                </Link>
                {/* <Link
                  href={`/merchant-portal/${merchantId}/platform/businesses/${business.id}/edit`}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  title="Edit business"
                >
                  <FiEdit2 className="h-4 w-4" />
                </Link> */}
                <button
                  onClick={() => {
                    setSelectedBusiness(business);
                    setIsDeleteModalOpen(true);
                  }}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  title="Delete business"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile view - cards */}
      <div className="md:hidden">
        {businesses.map((business) => (
          <div
            key={business.id}
            className="rounded-lg border border-gray-200 bg-white shadow-default dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{business.name}</h3>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${business.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}
                >
                  {business.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{business.contact_email}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{business.address}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">0 members</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">$0.00</p>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-end gap-2">
              <Link
                href={`/merchant-portal/${merchantId}/platform/businesses/${business.id}`}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <FiEye className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href={`/merchant-portal/${merchantId}/platform/businesses/${business.id}/edit`}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <FiEdit2 className="h-5 w-5" aria-hidden="true" />
              </Link>
              <button
                onClick={() => {
                  setSelectedBusiness(business);
                  setIsDeleteModalOpen(true);
                }}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <FiTrash2 className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBusiness(null);
        }}
        onConfirm={handleDelete}
        title="Delete Business"
        message={`Are you sure you want to delete ${selectedBusiness?.name}? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}


