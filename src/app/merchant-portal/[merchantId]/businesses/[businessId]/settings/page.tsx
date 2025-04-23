"use client";

import { useState, useEffect, use } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { FiSave } from 'react-icons/fi';
import { businessService } from '@/services/businessService';
import { useForm } from 'react-hook-form';
import type { Business } from '@/types/business';
import { Form, InputField, SelectField, CheckboxField, SubmitButton } from '@/components/ui/Form';

interface BusinessSettingsForm {
  // Business Info
  name: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
  currency: string;
  category: string;
  isVisibleInSearch: boolean;
  shortDescription: string;
  websiteUrl: string;
  instagramUrl: string;
  coverImage: string;
  // Notifications
  notifyNewMembers: boolean;
  notifyExpiringSubscriptions: boolean;
  notifyFailedPayments: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  // Billing
  allowAutoRenew: boolean;
  gracePeriodDays: number;
  sendPaymentReminders: boolean;
  reminderDaysBefore: number;
  allowPartialPayments: boolean;
}

export default function SettingsPage({ params }: { params: { businessId: string } }) {
  const unwrappedParams = use(params as unknown as Promise<{ businessId: string }>);
  const businessId = unwrappedParams.businessId;
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const { addNotification } = useNotification();

  const handleSubmit = async (data: BusinessSettingsForm) => {
    try {
      setIsLoading(true);
      
      // Convert form data to business update format
      const businessData = {
        name: data.name,
        contact_email: data.email,
        contact_phone: data.phone,
        address: data.address,
        timezone: data.timezone,
        currency: data.currency,
        is_visible_in_search: data.isVisibleInSearch,
        category: data.category,
        logo: data.coverImage,
        short_description: data.shortDescription,
        website_url: data.websiteUrl,
        instagram_url: data.instagramUrl,
      };

      await businessService.updateBusiness(Number(businessId), businessData);
      
      // Refresh the business data
      await loadBusiness();

      addNotification({
        type: 'success',
        message: 'Business settings updated successfully.',
      });
    } catch (error) {
      console.error('Error updating business:', error);
      addNotification({
        type: 'error',
        message: 'Failed to update business settings. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBusiness();
  }, [businessId]);

  const loadBusiness = async () => {
    try {
      setIsLoading(true);
      const business = await businessService.getBusiness(Number(businessId));
      setBusiness(business);
    } catch (error) {
      console.error('Error loading business:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load business settings. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Business Settings</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Manage your business preferences and configurations
        </p>
      </div>

      {/* Settings Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'general'
                ? 'border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('visibility')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'visibility'
                ? 'border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
            }`}
          >
            Visibility
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'notifications'
                ? 'border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'billing'
                ? 'border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
            }`}
          >
            Billing
          </button>
        </nav>
      </div>

      {/* Settings Form */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <Form 
          onSubmit={handleSubmit}
          defaultValues={{
            name: business?.name || '',
            email: business?.contact_email || '',
            phone: business?.contact_phone || '',
            address: business?.address || '',
            timezone: business?.timezone || 'UTC',
            currency: business?.currency || 'ETB',
            category: business?.category || '',
            isVisibleInSearch: business?.is_visible_in_search || false,
            shortDescription: business?.short_description || '',
            websiteUrl: business?.website_url || '',
            instagramUrl: business?.instagram_url || '',
            coverImage: business?.logo || '',
            notifyNewMembers: true,
            notifyExpiringSubscriptions: true,
            notifyFailedPayments: true,
            emailNotifications: true,
            smsNotifications: true,
            allowAutoRenew: true,
            gracePeriodDays: 7,
            sendPaymentReminders: true,
            reminderDaysBefore: 3,
            allowPartialPayments: false,
          }}
        >
          {(methods) => (
            <>
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6 p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Business Info</h2>
                  <div className="space-y-4">
                    <InputField
                      name="name"
                      label="Business Name"
                      placeholder="Enter business name"
                      rules={{ required: 'Business name is required' }}
                      methods={methods}
                    />
                    <InputField
                      name="email"
                      label="Business Email"
                      type="email"
                      placeholder="Enter business email"
                      rules={{ required: 'Business email is required' }}
                      methods={methods}
                    />
                    <InputField
                      name="phone"
                      label="Business Phone"
                      placeholder="Enter business phone"
                      rules={{ required: 'Business phone is required' }}
                      methods={methods}
                    />
                    <InputField
                      name="address"
                      label="Business Address"
                      placeholder="Enter business address"
                      rules={{ required: 'Business address is required' }}
                      methods={methods}
                    />
                    <SelectField
                      name="category"
                      label="Business Category"
                      options={[
                        { value: 'Beauty', label: 'Beauty' },
                        { value: 'Fitness', label: 'Fitness' },
                        { value: 'Wellness', label: 'Wellness' },
                        { value: 'Yoga', label: 'Yoga' },
                        { value: 'Spa', label: 'Spa' },
                        { value: 'Other', label: 'Other' },
                      ]}
                      rules={{ required: 'Business category is required' }}
                      methods={methods}
                    />
                    <SelectField
                      name="timezone"
                      label="Timezone"
                      options={[
                        { value: 'UTC', label: 'UTC' },
                        { value: 'ET', label: 'Africa/Addis Ababa' },
                        // Add more timezones as needed
                      ]}
                      rules={{ required: 'Timezone is required' }}
                      methods={methods}
                    />
                    <SelectField
                      name="currency"
                      label="Currency"
                      options={[
                        { value: 'ETB', label: 'ETB' },
                        { value: 'USD', label: 'USD' },
                        // Add more currencies as needed
                      ]}
                      rules={{ required: 'Currency is required' }}
                      methods={methods}
                    />
                  </div>
                </div>
              )}

              {/* Visibility Settings */}
              {activeTab === 'visibility' && (
                <div className="space-y-6 p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Customer App Visibility</h2>
                  <div className="space-y-4">
                    <CheckboxField
                      name="isVisibleInSearch"
                      label="Visible in customer app search"
                      description="Allow customers to find your business in the app"
                      methods={methods}
                    />
                    <InputField
                      name="coverImage"
                      label="Cover Image / Logo"
                      type="text"
                      placeholder="Upload image URL"
                      description="Used in explore page card (Recommended size: 1200x630px)"
                      methods={methods}
                    />
                    <InputField
                      name="shortDescription"
                      label="Short Description"
                      placeholder="Brief description for explore/search results (1-2 lines)"
                      rules={{
                        required: 'Short description is required',
                        maxLength: { value: 150, message: 'Description must be less than 150 characters' }
                      }}
                      methods={methods}
                    />
                    <InputField
                      name="websiteUrl"
                      label="Website URL"
                      placeholder="https://your-website.com"
                      methods={methods}
                    />
                    <InputField
                      name="instagramUrl"
                      label="Instagram Profile URL"
                      placeholder="https://instagram.com/your-profile"
                      methods={methods}
                    />
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6 p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Notification Preferences</h2>
                  <div className="space-y-4">
                    <div className="space-y-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notification Channels</h3>
                      <div className="space-y-4">
                        <CheckboxField
                          name="emailNotifications"
                          label="Email Notifications"
                          description="Receive notifications via email"
                          methods={methods}
                        />
                        <CheckboxField
                          name="smsNotifications"
                          label="SMS Notifications"
                          description="Receive notifications via SMS"
                          methods={methods}
                        />
                      </div>
                    </div>
                    <div className="space-y-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notification Types</h3>
                      <div className="space-y-4">
                        <CheckboxField
                          name="notifyNewMembers"
                          label="New Member Notifications"
                          description="Receive notifications when new members join"
                          methods={methods}
                        />
                        <CheckboxField
                          name="notifyExpiringSubscriptions"
                          label="Expiring Subscription Notifications"
                          description="Receive notifications when subscriptions are about to expire"
                          methods={methods}
                        />
                        <CheckboxField
                          name="notifyFailedPayments"
                          label="Failed Payment Notifications"
                          description="Receive notifications when payments fail"
                          methods={methods}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Settings */}
              {activeTab === 'billing' && (
                <div className="space-y-6 p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Billing Settings</h2>
                  <div className="space-y-4">
                    <div className="space-y-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Subscription Settings</h3>
                      <div className="space-y-4">
                        <CheckboxField
                          name="allowAutoRenew"
                          label="Allow Auto-Renewal"
                          description="Allow members to enable automatic subscription renewal"
                          methods={methods}
                        />
                        <InputField
                          name="gracePeriodDays"
                          label="Grace Period (Days)"
                          type="number"
                          description="Number of days to allow access after subscription expiry"
                          rules={{
                            required: 'Grace period is required',
                            min: { value: 0, message: 'Grace period must be 0 or more days' },
                            max: { value: 30, message: 'Grace period cannot exceed 30 days' },
                          }}
                          methods={methods}
                        />
                      </div>
                    </div>
                    <div className="space-y-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Payment Settings</h3>
                      <div className="space-y-4">
                        <CheckboxField
                          name="sendPaymentReminders"
                          label="Send Payment Reminders"
                          description="Send reminders before payment due dates"
                          methods={methods}
                        />
                        <InputField
                          name="reminderDaysBefore"
                          label="Reminder Days Before"
                          type="number"
                          description="Number of days before due date to send reminder"
                          rules={{
                            required: 'Reminder days is required',
                            min: { value: 1, message: 'Must be at least 1 day' },
                            max: { value: 30, message: 'Cannot exceed 30 days' },
                          }}
                          methods={methods}
                        />
                        <CheckboxField
                          name="allowPartialPayments"
                          label="Allow Partial Payments"
                          description="Allow members to make partial payments for subscriptions"
                          methods={methods}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end border-t border-gray-200 pt-6 dark:border-gray-700">
                <SubmitButton>
                  <FiSave className="mr-2 h-4 w-4" />
                  Save Changes
                </SubmitButton>
              </div>
            </>
          )}
        </Form>
      </div>
    </div>
  );
}
