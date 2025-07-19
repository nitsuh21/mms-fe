'use client'

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

export interface BusinessFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  is_active: boolean;
}

interface AddBusinessFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BusinessFormData) => void;
}

export default function AddBusinessForm({ isOpen, onClose, onSubmit }: AddBusinessFormProps) {
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    is_active: true
  });

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div 
          ref={modalRef}
          className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-400"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="px-8 py-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-full bg-brand-100 dark:bg-brand-900/50">
                <BuildingStorefrontIcon className="h-7 w-7 text-brand-600 dark:text-brand-300" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-white">
                  Add New Business
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Fill in the details below to add a new business
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm py-3 px-4"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm py-3 px-4"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm py-3 px-4"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address <span className="text-blue-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm py-3 px-4"
                />
              </div>
              
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website <span className="text-blue-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm py-3 px-4"
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="is_active" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                  Active Business
                </label>
              </div>
              
              <div className="pt-4 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-400 transition-colors duration-200"
                >
                  Add Business
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}