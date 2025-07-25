import { useForm } from 'react-hook-form';
import { FiUpload, FiTrash2, FiInfo, FiSave } from 'react-icons/fi';
import { InputField, SelectField } from '@/components/ui/Form';
import Image from 'next/image';
import type { BusinessSettingsForm } from '@/types/business-settings';

interface GeneralSettingsTabProps {
  methods: ReturnType<typeof useForm<BusinessSettingsForm>>;
  categoryChoices: { value: string; label: string }[];
  subcategoryChoices: { value: string; label: string }[];
  handleImageChange: (fieldName: 'logo' | 'coverImage', file: File | null) => void;
  handleImageRemove: (fieldName: 'logo' | 'coverImage') => void;
  currentValues: BusinessSettingsForm;
  onSaveMedia: () => void;
  onSaveDetails: () => void;
  isSavingMedia: boolean;
  isSavingDetails: boolean;
}

export function GeneralSettingsTab({
  methods,
  categoryChoices,
  subcategoryChoices,
  handleImageChange,
  handleImageRemove,
  currentValues,
  onSaveMedia,
  onSaveDetails,
  isSavingMedia,
  isSavingDetails,
}: GeneralSettingsTabProps) {
  return (
    <div className="space-y-8 p-6">
      <div className="border-b border-gray-200 pb-6 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">General Information</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update your business details and media
        </p>
      </div>

      {/* Media Upload Section */}
      <div className="space-y-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-white">
          <span className="mr-2 h-2 w-2 rounded-full bg-brand-500"></span>
          Business Media
        </h3>
        
        {/* Logo Upload */}
        <div className="space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50">
              {currentValues.logo ? (
                <img
                  src={URL.createObjectURL(currentValues.logo)}
                  alt="New logo"
                  className="h-full w-full object-cover"
                />
              ) : currentValues.currentLogo ? (
                <Image
                  src={currentValues.currentLogo}
                  alt="Business logo"
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Logo</span>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Business Logo
                </p>
                <p className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <FiInfo className="mr-1 h-3 w-3" />
                  Recommended size: 500×500px (1:1 ratio)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange('logo', e.target.files?.[0] || null)}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <FiUpload className="h-4 w-4" />
                  {currentValues.logo || currentValues.currentLogo ? 'Change' : 'Upload'}
                </label>
                {(currentValues.logo || currentValues.currentLogo) && (
                  <button
                    type="button"
                    onClick={() => handleImageRemove('logo')}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                  >
                    <FiTrash2 className="h-4 w-4" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image Upload */}
        <div className="space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative h-48 w-full max-w-2xl shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50 sm:h-40">
              {currentValues.coverImage ? (
                <img
                  src={URL.createObjectURL(currentValues.coverImage)}
                  alt="New cover"
                  className="h-full w-full object-cover"
                />
              ) : currentValues.currentCoverImage ? (
                <Image
                  src={currentValues.currentCoverImage}
                  alt="Business cover"
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Cover Image</span>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cover Image
                </p>
                <p className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <FiInfo className="mr-1 h-3 w-3" />
                  Recommended size: 1600×900px (16:9 ratio)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange('coverImage', e.target.files?.[0] || null)}
                  className="hidden"
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <FiUpload className="h-4 w-4" />
                  {currentValues.coverImage || currentValues.currentCoverImage ? 'Change' : 'Upload'}
                </label>
                {(currentValues.coverImage || currentValues.currentCoverImage) && (
                  <button
                    type="button"
                    onClick={() => handleImageRemove('coverImage')}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                  >
                    <FiTrash2 className="h-4 w-4" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="button"
            onClick={onSaveMedia}
            disabled={isSavingMedia}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-70 dark:focus:ring-offset-gray-800"
          >
            <FiSave className="h-4 w-4" />
            {isSavingMedia ? 'Saving...' : 'Save Media'}
          </button>
        </div>
      </div>

      {/* Business Info Fields */}
      <div className="space-y-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-white">
          <span className="mr-2 h-2 w-2 rounded-full bg-brand-500"></span>
          Business Details
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
          <SelectField
            name="category"
            label="Business Category"
            options={categoryChoices}
            methods={methods}
          />
          <SelectField
            name="subcategory"
            label="Business Subcategory"
            description="Select your business subcategory"
            options={subcategoryChoices}
            methods={methods}
          />
          <SelectField
            name="timezone"
            label="Timezone"
            options={[
              { value: 'UTC', label: 'UTC' },
              { value: 'ET', label: 'Africa/Addis Ababa' },
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
            ]}
            rules={{ required: 'Currency is required' }}
            methods={methods}
          />
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="button"
            onClick={onSaveDetails}
            disabled={isSavingDetails}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-70 dark:focus:ring-offset-gray-800"
          >
            <FiSave className="h-4 w-4" />
            {isSavingDetails ? 'Saving...' : 'Save Details'}
          </button>
        </div>
      </div>
    </div>
  );
}