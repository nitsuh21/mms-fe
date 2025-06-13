"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiSave } from "react-icons/fi";
import api from "@/services/api";
import { Business } from "@/types/business";

export default function EditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const merchantId = params?.merchantId as string;
  const businessId = params?.businessId as string;

  const [formData, setFormData] = useState<Partial<Business>>({
    name: "",
    email: "",
    phone: "",
    address: "",
    location: "",
    description: "", // Added description field
    currency: "ETB",
    currency_symbol: "Br",
    status: "active"
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await api.get<Business>(`/businesses/businesses/${businessId}/`);
        setFormData(response.data);
        console.log('Fetched business:', response.data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const excludeKeys = ['cover_image', 'logo'];
      const filteredPayload = Object.fromEntries(
        Object.entries(formData).filter(([key]) => !excludeKeys.includes(key))
      );

      await api.put(`/businesses/businesses/${businessId}/`, filteredPayload);
      router.push(`/merchant-portal/${merchantId}/platform/businesses/${businessId}`);
      router.refresh();
    } catch (err: any) {
      console.error("Error updating business:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Failed to update business"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'currency' && {
        currency_symbol: value === 'ETB' ? 'Br' : 
                        value === 'USD' ? '$' : 
                        value === 'EUR' ? '€' : 
                        value === 'GBP' ? '£' : ''
      })
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
          Edit Business
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Update business information
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Business Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Business Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Address
            </label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Currency
            </label>
            <select
              name="currency"
              id="currency"
              value={formData.currency}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:text-sm"
            >
              <option value="ETB">Ethiopian Birr (Br)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Status
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="description" // Changed from "address" to "description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Description
            </label>
            <textarea
              name="description" // Changed from "address" to "description"
              id="description" // Changed from "address" to "description"
              rows={3}
              value={formData.description || ''} // Changed to use formData.description
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-ceğiniz

System: 3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <FiSave className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}