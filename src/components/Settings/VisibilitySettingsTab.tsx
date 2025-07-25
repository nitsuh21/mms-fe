import { useForm } from 'react-hook-form';
import { InputField, CheckboxField } from '@/components/ui/Form';
import { FiInfo, FiSave } from 'react-icons/fi';
import type { BusinessSettingsForm } from '@/types/business-settings'; 

interface VisibilitySettingsTabProps {
  methods: ReturnType<typeof useForm<BusinessSettingsForm>>;
  onSaveVisibility: () => void;
  isSaving: boolean;
}

export function VisibilitySettingsTab({ 
  methods, 
  onSaveVisibility, 
  isSaving 
}: VisibilitySettingsTabProps) {
  return (
    <div className="space-y-8 p-6">
      <div className="border-b border-gray-200 pb-6 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Visibility Settings</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Control how your business appears to customers
        </p>
      </div>

      {/* Visibility Settings */}
      <div className="space-y-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-white">
          <span className="mr-2 h-2 w-2 rounded-full bg-brand-500"></span>
          Customer App Visibility
        </h3>
        
        <div className="space-y-6">
          <CheckboxField
            name="isVisibleInSearch"
            label="Visible in customer app search"
            description="Allow customers to find your business in the app search results"
            methods={methods}
          />
          
          <InputField
            name="shortDescription"
            label="Short Description"
            placeholder="Brief description for explore/search results (1-2 lines)"
            description="This will appear in search results and explore pages"
            rules={{
              required: 'Short description is required',
              maxLength: { value: 150, message: 'Description must be less than 150 characters' }
            }}
            methods={methods}
          />
        </div>
      </div>

      {/* Social Media Links */}
      <div className="space-y-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-white">
          <span className="mr-2 h-2 w-2 rounded-full bg-brand-500"></span>
          Social Media Links
        </h3>
        
        <div className="space-y-6">
          <InputField
            name="website"
            label="Website URL"
            placeholder="https://yourbusiness.com"
            description="Your main business website"
            methods={methods}
          />
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <InputField
              name="instagram"
              label="Instagram"
              placeholder="https://instagram.com/yourbusiness"
              methods={methods}
            />
            <InputField
              name="facebook"
              label="Facebook"
              placeholder="https://facebook.com/yourbusiness"
              methods={methods}
            />
            <InputField
              name="twitter"
              label="Twitter"
              placeholder="https://twitter.com/yourbusiness"
              methods={methods}
            />
            <InputField
              name="tiktok"
              label="TikTok"
              placeholder="https://tiktok.com/@yourbusiness"
              methods={methods}
            />
            <InputField
              name="youtube"
              label="YouTube"
              placeholder="https://youtube.com/yourbusiness"
              methods={methods}
            />
            <InputField
              name="whatsapp"
              label="WhatsApp"
              placeholder="https://wa.me/yournumber"
              methods={methods}
            />
            <InputField
              name="telegram"
              label="Telegram"
              placeholder="https://t.me/yourbusiness"
              methods={methods}
            />
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="button"
              onClick={onSaveVisibility}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-70 dark:focus:ring-offset-gray-800"
            >
              <FiSave className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Visibility Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}