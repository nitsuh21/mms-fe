'use client'

import { useState, useEffect } from 'react';
import { Customer } from '@/services/customerService';
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';

interface UpdateMemberFormProps {
  member: Customer;
  businessId: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function UpdateMemberForm({ member, businessId, isOpen, onClose, onSubmit }: UpdateMemberFormProps) {
  const [formData, setFormData] = useState({
    business: businessId,
    first_name: '',
    last_name: '',
    customer_id: '',
    email: '',
    phone: '',
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize form with member data
  useEffect(() => {
    if (isOpen && member) {
      setIsLoading(true);
      setFormData({
        business: businessId,
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        customer_id: member.customer_id || '',
        email: member.email || '',
        phone: member.phone || '',
        is_active: member.is_active !== undefined ? member.is_active : true
      });
      setIsLoading(false);
    }
  }, [isOpen, member, businessId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-md dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
          
          <div className="px-6 py-5">
            <div className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/50">
                <UserIcon className="h-6 w-6 text-brand-600 dark:text-brand-300" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                  Update Member
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Update the details for {member.first_name} {member.last_name}
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="mt-6 flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 dark:border-brand-400"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm py-2 px-3"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm py-2 px-3"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Customer ID <span className="text-blue-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="customer_id"
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm py-2 px-3"
                    placeholder="Leave blank if not applicable"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm py-2 px-3"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm py-2 px-3"
                    required
                    pattern="[0-9+\-\s]+"
                    title="Please enter a valid phone number"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Active Member
                  </label>
                </div>
                
                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-400 transition-colors duration-200"
                  >
                    Update Member
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}