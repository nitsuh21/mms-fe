"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/services/api";
import { Business } from "@/types/business";

export default function ViewBusinessPage() {
  const params = useParams();
  const businessId = params?.businessId as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await api.get<Business>(`/businesses/businesses/${businessId}/`);
        setBusiness(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching business:', err);
        setError('Failed to fetch business details');
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [businessId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">{error || 'Business not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {business.name}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            View business details
          </p>
        </div>

        {/* <Link
          href={`/merchant-portal/${merchantId}/platform/businesses/${businessId}/edit`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          <FiEdit className="h-4 w-4" />
          Edit Business
        </Link> */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Business Information</h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{business.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{business.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{business.phone || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{business.location || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{business.address || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Currency</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {business.currency} ({business.currency_symbol})
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  business.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {business.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Business Statistics</h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Members</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">0</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {business.currency_symbol}0.00
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
