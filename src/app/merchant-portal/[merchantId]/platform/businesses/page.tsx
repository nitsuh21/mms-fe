"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { FiEdit, FiTrash2, FiEye, FiPlus } from "react-icons/fi";

// Mock data for platform businesses
const mockBusinesses = [
  {
    id: "1",
    name: "Fitness Studio",
    owner: "John Smith",
    location: "New York",
    status: "active",
    memberCount: 120,
    revenue: "$12,345.67",
  },
  {
    id: "2",
    name: "Yoga Center",
    owner: "Sarah Johnson",
    location: "Los Angeles",
    status: "active",
    memberCount: 350,
    revenue: "$23,456.78",
  },
  {
    id: "3",
    name: "Dance Academy",
    owner: "Michael Brown",
    location: "Chicago",
    status: "inactive",
    memberCount: 75,
    revenue: "$8,765.43",
  },
  {
    id: "4",
    name: "Martial Arts Dojo",
    owner: "David Lee",
    location: "San Francisco",
    status: "active",
    memberCount: 180,
    revenue: "$15,432.10",
  },
  {
    id: "5",
    name: "Swimming Club",
    owner: "Emily Wilson",
    location: "Miami",
    status: "active",
    memberCount: 210,
    revenue: "$18,765.43",
  },
];

export default function PlatformBusinessesPage() {
  const params = useParams();
  const merchantId = params.merchantId as string;

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Platform Businesses</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage all businesses across your platform
          </p>
        </div>

        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600">
          <FiPlus className="h-4 w-4" />
          Add Business
        </button>
      </div>

      {/* Desktop view - table */}
      <div className="hidden md:block rounded-lg border border-gray-200 bg-white shadow-default dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-8 border-b border-gray-200 py-4 px-6 dark:border-gray-700">
          <div className="col-span-2">
            <h5 className="text-sm font-medium uppercase text-gray-700 dark:text-gray-300">Business Name</h5>
          </div>
          <div className="col-span-1">
            <h5 className="text-sm font-medium uppercase text-gray-700 dark:text-gray-300">Owner</h5>
          </div>
          <div className="col-span-1">
            <h5 className="text-sm font-medium uppercase text-gray-700 dark:text-gray-300">Location</h5>
          </div>
          <div className="col-span-1">
            <h5 className="text-sm font-medium uppercase text-gray-700 dark:text-gray-300">Status</h5>
          </div>
          <div className="col-span-1">
            <h5 className="text-sm font-medium uppercase text-gray-700 dark:text-gray-300">Members</h5>
          </div>
          <div className="col-span-1">
            <h5 className="text-sm font-medium uppercase text-gray-700 dark:text-gray-300">Revenue</h5>
          </div>
          <div className="col-span-1">
            <h5 className="text-sm font-medium uppercase text-gray-700 dark:text-gray-300">Actions</h5>
          </div>
        </div>

        {mockBusinesses.map((business, index) => (
          <div
            key={`desktop-${business.id}`}
            className={`grid grid-cols-8 ${
              index === mockBusinesses.length - 1
                ? ""
                : "border-b border-gray-200 dark:border-gray-700"
            } py-4 px-6`}
          >
            <div className="col-span-2">
              <Link
                href={`/merchant-portal/${merchantId}/businesses/${business.name.replace(/\s+/g, '-').toLowerCase()}/dashboard`}
                className="font-medium text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer"
              >
                {business.name}
              </Link>
            </div>
            <div className="col-span-1">
              <p className="text-gray-700 dark:text-gray-300">{business.owner}</p>
            </div>
            <div className="col-span-1">
              <p className="text-gray-700 dark:text-gray-300">{business.location}</p>
            </div>
            <div className="col-span-1">
              <span
                className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                  business.status === "active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {business.status}
              </span>
            </div>
            <div className="col-span-1">
              <p className="text-gray-700 dark:text-gray-300">{business.memberCount}</p>
            </div>
            <div className="col-span-1">
              <p className="text-gray-700 dark:text-gray-300">{business.revenue}</p>
            </div>
            <div className="col-span-1 flex items-center gap-2">
              <Link
                href={`/merchant-portal/${merchantId}/businesses/${business.name.replace(/\s+/g, '-').toLowerCase()}/dashboard`}
                className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
              >
                <FiEye className="text-lg" />
              </Link>
              <button className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400">
                <FiEdit className="text-lg" />
              </button>
              <button className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
                <FiTrash2 className="text-lg" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile view - cards */}
      <div className="md:hidden space-y-4">
        {mockBusinesses.map((business) => (
          <div
            key={`mobile-${business.id}`}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-default dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between mb-3">
              <Link
                href={`/merchant-portal/${merchantId}/businesses/${business.name.replace(/\s+/g, '-').toLowerCase()}/dashboard`}
                className="font-medium text-lg text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer"
              >
                {business.name}
              </Link>
              <span
                className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                  business.status === "active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {business.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Owner</p>
                <p className="text-gray-700 dark:text-gray-300">{business.owner}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-gray-700 dark:text-gray-300">{business.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Members</p>
                <p className="text-gray-700 dark:text-gray-300">{business.memberCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
                <p className="text-gray-700 dark:text-gray-300">{business.revenue}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <Link
                href={`/merchant-portal/${merchantId}/businesses/${business.name.replace(/\s+/g, '-').toLowerCase()}/dashboard`}
                className="p-2 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiEye className="text-lg" />
              </Link>
              <button className="p-2 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <FiEdit className="text-lg" />
              </button>
              <button className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <FiTrash2 className="text-lg" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
