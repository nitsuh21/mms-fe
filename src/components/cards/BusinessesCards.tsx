'use client'

import Link from "next/link";
import { FiEye, FiEdit2, FiTrash2, FiExternalLink } from "react-icons/fi";
import { Business } from "@/types/business";

interface BusinessesCardsProps {
  businesses: Business[];
  merchantId: string;
  onDeleteClick: (business: Business) => void;
}

export default function BusinessesCards({ businesses, merchantId, onDeleteClick }: BusinessesCardsProps) {
  return (
    <div className="md:hidden space-y-4">
      {businesses.map((business) => (
        <div
          key={business.id}
          className="rounded-lg border border-gray-200 bg-white shadow-default dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">{business.name}</h3>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  business.is_active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {business.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{business.email}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{business.address}</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">0 members</p>
              <div className="flex items-center gap-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {business.website || 'N/A'}
                </p>
                {business.website && (
                  <a
                    href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-500"
                    title="Visit website"
                  >
                    <FiExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-end gap-2">
            <Link
              href={`/merchant-portal/${merchantId}/businesses/${business.id}/dashboard`}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <FiEye className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href={`/merchant-portal/${merchantId}/businesses/${business.id}/settings`}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <FiEdit2 className="h-5 w-5" aria-hidden="true" />
            </Link>
            <button
              onClick={() => onDeleteClick(business)}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <FiTrash2 className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}