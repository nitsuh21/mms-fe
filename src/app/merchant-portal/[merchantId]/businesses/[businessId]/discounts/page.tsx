"use client";

import { useState } from 'react';
import { Form, InputField, SelectField, SubmitButton } from '@/components/ui/Form';
import { useNotification } from '@/context/NotificationContext';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  validFrom: string;
  validTo: string;
  status: 'active' | 'expired' | 'scheduled';
  usageLimit: number;
  usageCount: number;
}

// Mock data - replace with API call
const mockDiscounts: Discount[] = [
  {
    id: '1',
    code: 'SUMMER2025',
    type: 'percentage',
    value: 20,
    description: 'Summer special discount',
    validFrom: '2025-06-01',
    validTo: '2025-08-31',
    status: 'scheduled',
    usageLimit: 100,
    usageCount: 0,
  },
  {
    id: '2',
    code: 'WELCOME50',
    type: 'fixed',
    value: 50,
    description: 'New member discount',
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    status: 'active',
    usageLimit: 500,
    usageCount: 123,
  },
];

interface AddDiscountFormData {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  validFrom: string;
  validTo: string;
  usageLimit: number;
}

export default function DiscountsPage({ params }: { params: { businessId: string } }) {
  const [showAddDiscount, setShowAddDiscount] = useState(false);
  const { addNotification } = useNotification();

  const handleAddDiscount = (data: AddDiscountFormData) => {
    // Replace with API call
    console.log('Adding discount:', data);
    addNotification({
      type: 'success',
      title: 'Discount Added',
      message: 'New discount has been successfully created.',
    });
    setShowAddDiscount(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Discounts & Promos
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage your discount codes and promotional offers
          </p>
        </div>

        <button
          onClick={() => setShowAddDiscount(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          <FiPlus className="h-4 w-4" />
          Add Discount
        </button>
      </div>

      {/* Add Discount Form */}
      {showAddDiscount && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Add New Discount
          </h2>
          <Form<AddDiscountFormData> onSubmit={handleAddDiscount} className="space-y-4">
            {(methods) => (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    name="code"
                    label="Discount Code"
                    placeholder="e.g., SUMMER2025"
                    rules={{ required: 'Discount code is required' }}
                    methods={methods}
                  />
                  <SelectField
                    name="type"
                    label="Discount Type"
                    options={[
                      { value: 'percentage', label: 'Percentage' },
                      { value: 'fixed', label: 'Fixed Amount' },
                    ]}
                    rules={{ required: 'Discount type is required' }}
                    methods={methods}
                  />
                  <InputField
                    name="value"
                    label="Discount Value"
                    type="number"
                    placeholder="Enter discount value"
                    rules={{ required: 'Discount value is required' }}
                    methods={methods}
                  />
                  <InputField
                    name="usageLimit"
                    label="Usage Limit"
                    type="number"
                    placeholder="Enter usage limit"
                    rules={{ required: 'Usage limit is required' }}
                    methods={methods}
                  />
                  <InputField
                    name="validFrom"
                    label="Valid From"
                    type="date"
                    rules={{ required: 'Start date is required' }}
                    methods={methods}
                  />
                  <InputField
                    name="validTo"
                    label="Valid To"
                    type="date"
                    rules={{ required: 'End date is required' }}
                    methods={methods}
                  />
                  <div className="col-span-2">
                    <InputField
                      name="description"
                      label="Description"
                      placeholder="Enter discount description"
                      rules={{ required: 'Description is required' }}
                      methods={methods}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddDiscount(false)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <SubmitButton>Add Discount</SubmitButton>
                </div>
              </>
            )}
          </Form>
        </div>
      )}

      {/* Discounts Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Code</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Value</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Valid Period</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Usage</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {mockDiscounts.map((discount) => (
                <tr key={discount.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                    <span className="font-mono font-medium">{discount.code}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {discount.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {new Date(discount.validFrom).toLocaleDateString()} -{' '}
                    {new Date(discount.validTo).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        discount.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : discount.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {discount.status.charAt(0).toUpperCase() + discount.status.slice(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {discount.usageCount} / {discount.usageLimit}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          console.log('Edit discount:', discount);
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          console.log('Delete discount:', discount);
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
