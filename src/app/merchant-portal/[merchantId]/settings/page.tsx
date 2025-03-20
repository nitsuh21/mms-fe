"use client";

import { useParams } from "next/navigation";

export default function SettingsPage() {
  const params = useParams();
  const merchantId = params.merchantId as string;

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Merchant Settings
      </h4>
      <div className="flex flex-col gap-5.5 p-6.5">
        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Merchant ID
          </label>
          <input
            type="text"
            readOnly
            value={merchantId}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
        
        {/* Add more settings fields as needed */}
        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Merchant Name
          </label>
          <input
            type="text"
            placeholder="Enter merchant name"
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
        
        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Contact Email
          </label>
          <input
            type="email"
            placeholder="Enter contact email"
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
        
        <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-white">
          Save Changes
        </button>
      </div>
    </div>
  );
}
