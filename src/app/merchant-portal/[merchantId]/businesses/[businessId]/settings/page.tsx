"use client";

import { useState, useEffect, use } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { FiSave, FiChevronRight } from 'react-icons/fi';
import { businessService } from '@/services/businessService';
import { useForm, SubmitHandler } from 'react-hook-form';
import type { Business } from '@/types/business';
import { SubmitButton } from '@/components/ui/Form';
import { GeneralSettingsTab } from '@/components/Settings/GeneralSettingsTab';
import { VisibilitySettingsTab } from '@/components/Settings/VisibilitySettingsTab';
import type { BusinessSettingsForm } from '@/types/business-settings';
import { useLoading } from '@/context/LoadingContext';


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
  // const [isLoading, setIsLoading] = useState(true);
   const { isLoading, setIsLoading } = useLoading();
  const [activeTab, setActiveTab] = useState('general');
  const [isSavingMedia, setIsSavingMedia] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const { addNotification } = useNotification();
  const [isSavingVisibility, setIsSavingVisibility] = useState(false);

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
      coverImage: null,
      logo: null,
      currentCoverImage: '',
      currentLogo: '',
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
      const formData: Partial<BusinessSettingsForm> = {
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
        currentCoverImage: business.cover_image || '',
        currentLogo: business.logo || '',
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


  const handleSaveVisibility = async () => {
  try {
    setIsSavingVisibility(true);
    const data = methods.getValues();
    
    const visibilityData = {
      is_visible_in_search: data.isVisibleInSearch,
      // short_description: data.shortDescription,
      description:data.shortDescription,
      website: data.website,
      instagram: data.instagram,
      facebook: data.facebook,
      twitter: data.twitter,
      tiktok: data.tiktok,
      youtube: data.youtube,
      whatsapp: data.whatsapp,
      telegram: data.telegram
    };

    const updatedBusiness = await businessService.updateBusiness(businessId, visibilityData);
    setBusiness(updatedBusiness);

    addNotification({
      type: 'success',
      title: 'Success',
      message: 'Visibility settings updated successfully.',
    });
  } catch (error) {
    console.error('Error updating visibility settings:', error);
    addNotification({
      type: 'error',
      title: 'Error',
      message: 'Failed to update visibility settings. Please try again.',
    });
  } finally {
    setIsSavingVisibility(false);
  }
};

  const handleSaveMedia = async () => {
  try {
    setIsSavingMedia(true);
    const data = methods.getValues();
    const formData = new FormData();
    
    // Handle new uploads
    if (data.logo instanceof File) {
      formData.append('logo', data.logo);
    } else if (data.currentLogo === '') {
      // This indicates the logo was removed
      formData.append('logo', ''); // Sending empty string to clear it
    }

    if (data.coverImage instanceof File) {
      formData.append('cover_image', data.coverImage);
    } else if (data.currentCoverImage === '') {
      // This indicates the cover image was removed
      formData.append('cover_image', ''); // Sending empty string to clear it
    }

    const updatedBusiness = await businessService.updateBusiness(businessId, formData);
    setBusiness(updatedBusiness);

    // Reset form with updated values
    methods.reset({
      ...methods.getValues(),
      logo: null,
      coverImage: null,
      currentLogo: updatedBusiness.logo || '',
      currentCoverImage: updatedBusiness.cover_image || ''
    });

    addNotification({
      type: 'success',
      title: 'Success',
      message: 'Business media updated successfully.',
    });
  } catch (error) {
    console.error('Error updating business media:', error);
    addNotification({
      type: 'error',
      title: 'Error',
      message: 'Failed to update business media. Please try again.',
    });
  } finally {
    setIsSavingMedia(false);
  }
};



  const handleSaveDetails = async () => {
    try {
      setIsSavingDetails(true);
      const data = methods.getValues();
      
      const businessData = {
        name: data.name,
        email: data.email,
        phone: String(data.phone),
        address: data.address,
        is_visible_in_search: data.isVisibleInSearch,
        category: data.category,
        subcategory: data.subcategory,
        // short_description: data.shortDescription,
        description: data.shortDescription,
        website: data.website,
        instagram: data.instagram,
        currency: data.currency,
        currency_symbol: 
          data.currency === 'ETB' ? 'Br' : 
          data.currency === 'USD' ? '$' : 
          data.currency === 'EUR' ? '€' : 
          data.currency === 'GBP' ? '£' : 'Br'
      };

      const updatedBusiness = await businessService.updateBusiness(businessId, businessData);
      setBusiness(updatedBusiness);

      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Business details updated successfully.',
      });
    } catch (error) {
      console.error('Error updating business details:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update business details. Please try again.',
      });
    } finally {
      setIsSavingDetails(false);
    }
  };

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        setIsLoading(true);
        const data = await businessService.getBusiness(businessId);
        setBusiness(data);
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

    loadBusiness();
  }, [businessId, addNotification]);

  const handleImageChange = (fieldName: 'logo' | 'coverImage', file: File | null) => {
    methods.setValue(fieldName, file);
  };

  const handleImageRemove = (fieldName: 'logo' | 'coverImage') => {
    methods.setValue(fieldName, null);
    if (fieldName === 'logo') {
      methods.setValue('currentLogo', '');
    } else {
      methods.setValue('currentCoverImage', '');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const currentValues = methods.watch();

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Business</span>
          <FiChevronRight className="h-4 w-4" />
          <span className="text-brand-600 dark:text-brand-400">Settings</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Business Settings
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Manage your business preferences and configurations
        </p>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`relative whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'general'
                ? 'border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
            }`}
          >
            General
            {activeTab === 'general' && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-500 dark:bg-brand-400"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('visibility')}
            className={`relative whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'visibility'
                ? 'border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
            }`}
          >
            Visibility
            {activeTab === 'visibility' && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-500 dark:bg-brand-400"></span>
            )}
          </button>
        </nav>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="w-full">
          <div>
            {activeTab === 'general' && (
              <GeneralSettingsTab
                methods={methods}
                categoryChoices={CATEGORY_CHOICES}
                subcategoryChoices={SUBCATEGORY_CHOICES}
                handleImageChange={handleImageChange}
                handleImageRemove={handleImageRemove}
                currentValues={currentValues}
                onSaveMedia={handleSaveMedia}
                onSaveDetails={handleSaveDetails}
                isSavingMedia={isSavingMedia}
                isSavingDetails={isSavingDetails}
              />
            )}

          {activeTab === 'visibility' && (
          <VisibilitySettingsTab 
            methods={methods} 
            onSaveVisibility={handleSaveVisibility}
            isSaving={isSavingVisibility}
          />
        )}
          </div>
        </div>
      </div>
    </div>
  );
}