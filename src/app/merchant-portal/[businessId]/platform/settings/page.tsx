"use client";

import { useState } from 'react';
import { FiSave, FiMail, FiLock, FiGlobe, FiBell } from 'react-icons/fi';

export default function PlatformSettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Platform Settings</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Manage your platform preferences and configurations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <FiGlobe className="h-5 w-5 text-gray-400" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                General Settings
              </h2>
            </div>
          </div>
          <form onSubmit={handleSave} className="space-y-6 p-6">
            <div>
              <label
                htmlFor="platform-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Platform Name
              </label>
              <input
                type="text"
                id="platform-name"
                className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                defaultValue="MMS Platform"
              />
            </div>
            <div>
              <label
                htmlFor="support-email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Support Email
              </label>
              <input
                type="email"
                id="support-email"
                className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                defaultValue="support@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="timezone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Default Timezone
              </label>
              <select
                id="timezone"
                className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                defaultValue="UTC+3"
              >
                <option>UTC</option>
                <option>UTC+1</option>
                <option>UTC+2</option>
                <option>UTC+3</option>
                <option>UTC+4</option>
              </select>
            </div>
          </form>
        </div>

        {/* Email Settings */}
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <FiMail className="h-5 w-5 text-gray-400" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Email Settings
              </h2>
            </div>
          </div>
          <form onSubmit={handleSave} className="space-y-6 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email Templates
              </label>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="welcome-email"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600"
                    defaultChecked
                  />
                  <label
                    htmlFor="welcome-email"
                    className="ml-3 block text-sm text-gray-700 dark:text-gray-200"
                  >
                    Welcome Email
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="invoice-email"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600"
                    defaultChecked
                  />
                  <label
                    htmlFor="invoice-email"
                    className="ml-3 block text-sm text-gray-700 dark:text-gray-200"
                  >
                    Invoice Notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="report-email"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600"
                    defaultChecked
                  />
                  <label
                    htmlFor="report-email"
                    className="ml-3 block text-sm text-gray-700 dark:text-gray-200"
                  >
                    Monthly Reports
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Security Settings */}
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <FiLock className="h-5 w-5 text-gray-400" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Security Settings
              </h2>
            </div>
          </div>
          <form onSubmit={handleSave} className="space-y-6 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Two-Factor Authentication
              </label>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="require-2fa"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600"
                    defaultChecked
                  />
                  <label
                    htmlFor="require-2fa"
                    className="ml-3 block text-sm text-gray-700 dark:text-gray-200"
                  >
                    Require 2FA for all admin users
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Password Policy
              </label>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="password-expiry"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600"
                    defaultChecked
                  />
                  <label
                    htmlFor="password-expiry"
                    className="ml-3 block text-sm text-gray-700 dark:text-gray-200"
                  >
                    Password expires every 90 days
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="password-complexity"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600"
                    defaultChecked
                  />
                  <label
                    htmlFor="password-complexity"
                    className="ml-3 block text-sm text-gray-700 dark:text-gray-200"
                  >
                    Enforce password complexity requirements
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Notification Settings */}
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <FiBell className="h-5 w-5 text-gray-400" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Notification Settings
              </h2>
            </div>
          </div>
          <form onSubmit={handleSave} className="space-y-6 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                System Notifications
              </label>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="business-alerts"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600"
                    defaultChecked
                  />
                  <label
                    htmlFor="business-alerts"
                    className="ml-3 block text-sm text-gray-700 dark:text-gray-200"
                  >
                    Business alerts and updates
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="security-alerts"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600"
                    defaultChecked
                  />
                  <label
                    htmlFor="security-alerts"
                    className="ml-3 block text-sm text-gray-700 dark:text-gray-200"
                  >
                    Security alerts
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="maintenance-alerts"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600"
                    defaultChecked
                  />
                  <label
                    htmlFor="maintenance-alerts"
                    className="ml-3 block text-sm text-gray-700 dark:text-gray-200"
                  >
                    Maintenance notifications
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
          onClick={handleSave}
        >
          <FiSave className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
