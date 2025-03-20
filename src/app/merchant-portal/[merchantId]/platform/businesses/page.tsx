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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Platform Businesses</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage all businesses across your platform
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600">
          <FiPlus className="h-4 w-4" />
          Add Business
        </button>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="grid grid-cols-8 border-b border-stroke py-4 px-6 dark:border-strokedark">
          <div className="col-span-2">
            <h5 className="text-sm font-medium uppercase">Business Name</h5>
          </div>
          <div className="col-span-1">
            <h5 className="text-sm font-medium uppercase">Owner</h5>
          </div>
          <div className="col-span-1">
            <h5 className="text-sm font-medium uppercase">Location</h5>
          </div>
          <div className="col-span-1">
            <h5 className="text-sm font-medium uppercase">Status</h5>
          </div>
          <div className="col-span-1">
            <h5 className="text-sm font-medium uppercase">Members</h5>
          </div>
          <div className="col-span-1">
            <h5 className="text-sm font-medium uppercase">Revenue</h5>
          </div>
          <div className="col-span-1">
            <h5 className="text-sm font-medium uppercase">Actions</h5>
          </div>
        </div>

        {mockBusinesses.map((business, index) => (
          <div
            key={business.id}
            className={`grid grid-cols-8 ${
              index === mockBusinesses.length - 1
                ? ""
                : "border-b border-stroke dark:border-strokedark"
            } py-4 px-6`}
          >
            <div className="col-span-2">
              <Link
                href={`/merchant-portal/${merchantId}/businesses/${business.name.replace(/\s+/g, '-').toLowerCase()}/dashboard`}
                className="font-medium text-black dark:text-white hover:text-primary cursor-pointer"
              >
                {business.name}
              </Link>
            </div>
            <div className="col-span-1">
              <p className="text-black dark:text-white">{business.owner}</p>
            </div>
            <div className="col-span-1">
              <p className="text-black dark:text-white">{business.location}</p>
            </div>
            <div className="col-span-1">
              <span
                className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                  business.status === "active"
                    ? "bg-success bg-opacity-10 text-success"
                    : "bg-danger bg-opacity-10 text-danger"
                }`}
              >
                {business.status}
              </span>
            </div>
            <div className="col-span-1">
              <p className="text-black dark:text-white">{business.memberCount}</p>
            </div>
            <div className="col-span-1">
              <p className="text-black dark:text-white">{business.revenue}</p>
            </div>
            <div className="col-span-1 flex items-center gap-2">
              <Link
                href={`/merchant-portal/${merchantId}/businesses/${business.name.replace(/\s+/g, '-').toLowerCase()}/dashboard`}
                className="hover:text-primary"
              >
                <FiEye className="text-lg" />
              </Link>
              <button className="hover:text-primary">
                <FiEdit className="text-lg" />
              </button>
              <button className="hover:text-danger">
                <FiTrash2 className="text-lg" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
