"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";


export default function BusinessesPage() {
  const params = useParams();
  const merchantId = params?.merchantId as string;

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Your Businesses
        </h4>
        <Link
          href={`/merchant-portal/${merchantId}/businesses/new`}
          className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
        >
          Add New Business
        </Link>
      </div>

      <div className="flex flex-col">
        <div className="grid grid-cols-6 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-8">
          <div className="p-2.5 xl:p-5 col-span-2">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Business Name
            </h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Location
            </h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Status
            </h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Members
            </h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Plans
            </h5>
          </div>
          <div className="p-2.5 xl:p-5 col-span-2">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Actions
            </h5>
          </div>
        </div>

        {mockBusinesses.map((business, index) => (
          <div
            key={business.id}
            className={`grid grid-cols-6 sm:grid-cols-8 ${
              index === mockBusinesses.length - 1
                ? ""
                : "border-b border-stroke dark:border-strokedark"
            }`}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5 col-span-2">
              <div className="flex-1">
                <h5 className="font-medium text-black dark:text-white">
                  {business.name}
                </h5>
              </div>
            </div>

            <div className="flex items-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{business.location}</p>
            </div>

            <div className="flex items-center p-2.5 xl:p-5">
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

            <div className="flex items-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{business.memberCount}</p>
            </div>

            <div className="flex items-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{business.planCount}</p>
            </div>

            <div className="flex items-center gap-2 p-2.5 xl:p-5 col-span-2">
              <Link
                href={`/merchant-portal/${merchantId}/businesses/${business.name.replace(/\s+/g, '-').toLowerCase()}/dashboard`}
                className="hover:text-primary"
              >
                <FiEye className="text-lg" />
              </Link>
              <Link
                href={`/merchant-portal/${merchantId}/businesses/${business.name.replace(/\s+/g, '-').toLowerCase()}/settings`}
                className="hover:text-primary"
              >
                <FiEdit className="text-lg" />
              </Link>
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
