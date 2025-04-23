"use client";

import { useState } from 'react';
import { Form, InputField, SelectField, CheckboxField, SubmitButton } from '@/components/ui/Form';
import { useNotification } from '@/context/NotificationContext';
import { FiSave } from 'react-icons/fi';

interface BusinessSettings {
  // Business Info
  name: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
  currency: string;

  // Visibility Settings
  isVisibleInSearch: boolean;
  category: string;
  coverImage: string;
  shortDescription: string;
  websiteUrl?: string;
  instagramUrl?: string;

  // Notification Settings
  notifyNewMembers: boolean;
  notifyExpiringSubscriptions: boolean;
  notifyFailedPayments: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;

  // Billing Settings
  allowAutoRenew: boolean;
  gracePeriodDays: number;
  sendPaymentReminders: boolean;
  reminderDaysBefore: number;
  allowPartialPayments: boolean;
}

// Mock data - replace with API call
const mockSettings: BusinessSettings = {
  name: 'Fitness Studio',
  email: 'contact@fitnessstudio.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main St, City, State 12345',
  timezone: 'America/New_York',
  currency: 'ETB',
  isVisibleInSearch: true,
  category: 'Fitness',
  coverImage: '',
  shortDescription: 'Premier fitness studio offering personalized training and group classes',
  websiteUrl: 'https://fitnessstudio.com',
  instagramUrl: 'https://instagram.com/fitnessstudio',
  notifyNewMembers: true,
  notifyExpiringSubscriptions: true,
  notifyFailedPayments: true,
  emailNotifications: true,
  smsNotifications: false,
  allowAutoRenew: true,
  gracePeriodDays: 7,
  sendPaymentReminders: true,
  reminderDaysBefore: 3,
  allowPartialPayments: false,
};

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
];

const currencies = [
  { value: 'ETB', label: 'Ethiopian Birr (ETB)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
];

const businessCategories = [
  { value: 'Fitness', label: 'Fitness' },
  { value: 'Beauty', label: 'Beauty' },
  { value: 'Health', label: 'Health' },
  { value: 'Coaching', label: 'Coaching' },
  { value: 'Wellness', label: 'Wellness' },
  { value: 'Yoga', label: 'Yoga' },
  { value: 'Spa', label: 'Spa' },
  { value: 'Other', label: 'Other' },
];

export default function SettingsPage({ params }: { params: { businessId: string } }) {
  const [activeTab, setActiveTab] = useState('general');
  const { addNotification } = useNotification();

  const handleSaveSettings = async (data: BusinessSettings) => {
    // Replace with API call
    console.log('Saving settings:', data);
    addNotification({
      type: 'success',
      title: 'Settings Updated',
      message: 'Your business settings have been successfully updated.',
    });
  };

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
        <Form<BusinessSettings>
          onSubmit={handleSaveSettings}
          defaultValues={mockSettings}
          className="space-y-6 p-6"
        >
          {(methods) => (
            <>
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
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
                      name="timezone"
                      label="Timezone"
                      options={timezones}
                      rules={{ required: 'Timezone is required' }}
                      methods={methods}
                    />
                    <SelectField
                      name="currency"
                      label="Currency"
                      options={currencies}
                      rules={{ required: 'Currency is required' }}
                      methods={methods}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'visibility' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Customer App Visibility</h2>
                  <div className="space-y-4">
                    <CheckboxField
                      name="isVisibleInSearch"
                      label="Visible in customer app search"
                      description="Allow customers to find your business in the app"
                      methods={methods}
                    />
                    <SelectField
                      name="category"
                      label="Business Category"
                      options={businessCategories}
                      rules={{ required: 'Business category is required' }}
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

              {activeTab === 'notifications' && (
                <div className="space-y-6">
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

              {activeTab === 'billing' && (
                <div className="space-y-6">
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
