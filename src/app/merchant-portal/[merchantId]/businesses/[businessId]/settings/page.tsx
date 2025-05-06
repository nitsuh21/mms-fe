"use client";

import { useState, useEffect, use, useRef } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { FiSave, FiUpload, FiTrash2 } from 'react-icons/fi';
import { businessService } from '@/services/businessService';
import { useForm, SubmitHandler } from 'react-hook-form';
import type { Business } from '@/types/business';
import { Form, InputField, CheckboxField, SubmitButton } from '@/components/ui/Form';
import { SelectField, type SelectFieldProps } from '@/components/ui/Form/SelectField';
import Image from 'next/image';


interface BusinessSettingsForm {
  // Business Info
  name: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
  currency: string;
  category: string;
  subcategory: string;
  isVisibleInSearch: boolean;
  shortDescription: string;
  website: string;
  instagram: string;
  facebook: string;
  twitter: string;
  tiktok: string;
  youtube: string;
  whatsapp: string;
  telegram: string;
  coverImage: string;
  logo: string;

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

const CATEGORY_CHOICES = [
  { value: 'restaurant', label: 'Restaurant & Food' },
  { value: 'retail', label: 'Retail & Shopping' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'beauty', label: 'Beauty & Personal Care' },
  { value: 'entertainment', label: 'Entertainment & Events' },
  { value: 'education', label: 'Education & Training' },
  { value: 'professional', label: 'Professional Services' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'travel', label: 'Travel & Tourism' },
  { value: 'other', label: 'Other' },
];

const SUBCATEGORY_CHOICES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe & Coffee Shop' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'fast_food', label: 'Fast Food' },
  { value: 'grocery', label: 'Grocery Store' },
  { value: 'supermarket', label: 'Supermarket' },
  { value: 'clothing', label: 'Clothing & Fashion' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture & Home' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'clinic', label: 'Medical Clinic' },
  { value: 'fitness', label: 'Fitness Center' },
  { value: 'spa', label: 'Spa & Wellness' },
  { value: 'salon', label: 'Hair & Beauty Salon' },
  { value: 'cinema', label: 'Cinema & Theater' },
  { value: 'sports', label: 'Sports & Recreation' },
  { value: 'school', label: 'School & Academy' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'auto_service', label: 'Auto Service & Repair' },
  { value: 'hotel', label: 'Hotel & Accommodation' },
  { value: 'travel_agency', label: 'Travel Agency' },
  { value: 'other', label: 'Other' },
];

export default function SettingsPage({ params }: { params: { businessId: string } }) {
  const unwrappedParams = use(params as unknown as Promise<{ businessId: string }>);
  const businessId = unwrappedParams.businessId;
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  const { addNotification } = useNotification();
  const methods = useForm<BusinessSettingsForm>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      timezone: 'UTC',
      currency: 'ETB',
      category: '',
      subcategory: '',
      isVisibleInSearch: false,
      shortDescription: '',
      website: '',
      instagram: '',
      facebook: '',
      twitter: '',
      tiktok: '',
      youtube: '',
      telegram: '',
      coverImage: '',
      logo: '',
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
    }
  });

  useEffect(() => {
    if (business) {
      const formData: BusinessSettingsForm = {
        name: business.name || '',
        email: business.email || '',
        phone: business.phone || '',
        address: business.address || '',
        timezone: business.timezone || 'UTC',
        currency: business.currency || 'ETB',
        category: business.category || '',
        subcategory: business.subcategory || '',
        isVisibleInSearch: business.is_visible_in_search || false,
        shortDescription: business.description || '',
        website: business.website || '',
        instagram: business.instagram || '',
        facebook: business.facebook || '',
        twitter: business.twitter || '',
        tiktok: business.tiktok || '',
        youtube: business.youtube || '',
        whatsapp: business.whatsapp || '',
        telegram: business.telegram || '',
        coverImage: business.cover_image || '',
        logo: business.logo || '',
        notifyNewMembers: business.notify_new_members ?? true,
        notifyExpiringSubscriptions: business.notify_expiring_subscriptions ?? true,
        notifyFailedPayments: business.notify_failed_payments ?? true,
        emailNotifications: business.email_notifications ?? true,
        smsNotifications: business.sms_notifications ?? true,
        allowAutoRenew: business.allow_auto_renew ?? true,
        gracePeriodDays: business.grace_period_days ?? 7,
        sendPaymentReminders: business.send_payment_reminders ?? true,
        reminderDaysBefore: business.reminder_days_before ?? 3,
        allowPartialPayments: business.allow_partial_payments ?? false,
      };
      methods.reset(formData);
    }
  }, [business, methods]);


  const onSubmit: SubmitHandler<BusinessSettingsForm> = async (data) => {
    try {
      setIsLoading(true);
      console.log('handling data', {data});
      const businessData = {
        name: data.name,
        email: data.email,
        phone: String(data.phone),
        address: data.address,
        is_visible_in_search: data.isVisibleInSearch,
        category: data.category,
        subcategory: data.subcategory,
        short_description: data.shortDescription,
        website: data.website,
        instagram: data.instagram,
        currency: data.currency,
        currency_symbol: data.currency === 'ETB' ? 'Br' : 
                        data.currency === 'USD' ? '$' : 
                        data.currency === 'EUR' ? '€' : 
                        data.currency === 'GBP' ? '£' : 'Br'
      };

      const updatedBusiness = await businessService.updateBusiness(businessId, businessData);
      
      // Update local state
      setBusiness(updatedBusiness);

      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Business settings updated successfully.',
      });
    } catch (error) {
      console.error('Error updating business:', error);
      addNotification({
        type: 'error',
        title: 'Error',
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
      const data = await businessService.getBusiness(businessId);
      setBusiness(data);

      // Form will be initialized in useEffect
    } catch (error) {
      console.error('Error loading business:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load business settings. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (event.target.files?.[0]) {
        await businessService.updateBusinessLogo(businessId, event.target.files[0]);
      }
      const updatedBusiness = await businessService.getBusiness(businessId);
      setBusiness(updatedBusiness);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Logo updated successfully.',
      });
    } catch (error) {
      console.error('Error updating logo:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update logo. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (event.target.files?.[0]) {
        await businessService.updateBusinessCover(businessId, event.target.files[0]);
      }
      const updatedBusiness = await businessService.getBusiness(businessId);
      setBusiness(updatedBusiness);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Cover image updated successfully.',
      });
    } catch (error) {
      console.error('Error updating cover image:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update cover image. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoRemove = async () => {
    try {
      await businessService.removeBusinessLogo(businessId);
      const updatedBusiness = await businessService.getBusiness(businessId);
      setBusiness(updatedBusiness);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Logo removed successfully.',
      });
    } catch (error) {
      console.error('Error removing logo:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove logo. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoverRemove = async () => {
    try {
      await businessService.removeBusinessCover(businessId);
      const updatedBusiness = await businessService.getBusiness(businessId);
      setBusiness(updatedBusiness);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Cover image removed successfully.',
      });
    } catch (error) {
      console.error('Error removing cover image:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove cover image. Please try again.',
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
          {/* <button
            onClick={() => setActiveTab('notifications')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'notifications'
                ? 'border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
            }`}
            disabled
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
            disabled
          >
            Billing
          </button> */}
        </nav>
      </div>

      {/* Settings Form */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <form onSubmit={methods.handleSubmit(onSubmit)} className="w-full">
          <div>
            {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6 p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">General Information</h2>

                  {/* Media Upload Section */}
                  <div className="space-y-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Business Media</h3>
                    
                    {/* Logo Upload */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-24 w-24 overflow-hidden rounded-lg border dark:border-gray-700">
                          {business?.logo ? (
                            <Image
                              src={business.logo}
                              alt="Business logo"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                              <span className="text-sm text-gray-500 dark:text-gray-400">No logo</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            ref={logoInputRef}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="inline-flex items-center rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                          >
                            <FiUpload className="-ml-0.5 mr-2 h-4 w-4" />
                            Upload Logo
                          </button>
                          {business?.logo && (
                            <button
                              type="button"
                              onClick={handleLogoRemove}
                              className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 ml-5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                            >
                              <FiTrash2 className="-ml-0.5 h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cover Image Upload */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-32 w-64 overflow-hidden rounded-lg border dark:border-gray-700">
                          {business?.cover_image ? (
                            <Image
                              src={business.cover_image}
                              alt="Business cover"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                              <span className="text-sm text-gray-500 dark:text-gray-400">No cover image</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverUpload}
                            ref={coverInputRef}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => coverInputRef.current?.click()}
                            className="inline-flex items-center rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                          >
                            <FiUpload className="-ml-0.5 mr-2 h-4 w-4" />
                            Upload Cover
                          </button>
                          {business?.cover_image && (
                            <button
                              type="button"
                              onClick={handleCoverRemove}
                              className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 ml-5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                            >
                              <FiTrash2 className="-ml-0.5 h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
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
                        methods={methods}
                      />
                    </div>
                    <SelectField
                      name="category"
                      label="Business Category"
                      options={CATEGORY_CHOICES}
                      methods={methods}
                    />
                    <SelectField
                      name="subcategory"
                      label="Business Subcategory"
                      description="Select your business subcategory"
                      options={SUBCATEGORY_CHOICES}
                      methods={methods}
                    />
                    <SelectField<BusinessSettingsForm>
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
                    <SelectField<BusinessSettingsForm>
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
                      name="shortDescription"
                      label="Short Description"
                      placeholder="Brief description for explore/search results (1-2 lines)"
                      rules={{
                        required: 'Short description is required',
                        maxLength: { value: 150, message: 'Description must be less than 150 characters' }
                      }}
                      methods={methods}
                    />
                    <div className="space-y-4">
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">Social Media Links</h3>
                      <InputField
                        name="website"
                        label="Website URL"
                        placeholder="Enter business website URL"
                        methods={methods}
                      />
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField
                          name="instagram"
                          label="Instagram URL"
                          placeholder="Enter Instagram profile URL"
                          methods={methods}
                        />
                        <InputField
                          name="facebook"
                          label="Facebook URL"
                          placeholder="Enter Facebook profile URL"
                          methods={methods}
                        />
                        <InputField
                          name="twitter"
                          label="Twitter URL"
                          placeholder="Enter Twitter profile URL"
                          methods={methods}
                        />
                        <InputField
                          name="tiktok"
                          label="TikTok URL"
                          placeholder="Enter TikTok profile URL"
                          methods={methods}
                        />
                        <InputField
                          name="youtube"
                          label="YouTube URL"
                          placeholder="Enter YouTube channel URL"
                          methods={methods}
                        />
                        <InputField
                          name="whatsapp"
                          label="WhatsApp URL"
                          placeholder="Enter WhatsApp contact URL"
                          methods={methods}
                        />
                        <InputField
                          name="telegram"
                          label="Telegram URL"
                          placeholder="Enter Telegram contact URL"
                          methods={methods}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {/* {activeTab === 'notifications' && (
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
              )} */}

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
          </div>
        </form>
      </div>
    </div>
  );
}
