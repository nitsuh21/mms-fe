"use client";

import { useState, useEffect } from "react";
import { FiSave } from "react-icons/fi";
import { authService } from "@/services/authService";
import { useRouter, useSearchParams } from "next/navigation";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, ROUTES } from "@/config";

export default function PlatformSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get tab from URL if available
    const tabParam = searchParams.get('tab');
    if (tabParam && ['general', 'account', 'branding', 'billing', 'notifications', 'security', 'integrations', 'logout'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setProfileData({
          ...profileData,
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          email: userData.email || "",
          phone: userData.phone || "",
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleProfileSubmit = async () => {
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Validate password if provided
      if (profileData.new_password) {
        if (!profileData.current_password) {
          setMessage({ type: "error", text: "Current password is required to set a new password" });
          setIsLoading(false);
          return;
        }
        if (profileData.new_password !== profileData.confirm_password) {
          setMessage({ type: "error", text: "New passwords do not match" });
          setIsLoading(false);
          return;
        }
      }

      // Prepare data for submission
      const updateData: any = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
      };

      // Only include password fields if a new password is being set
      if (profileData.new_password) {
        updateData.current_password = profileData.current_password;
        updateData.new_password = profileData.new_password;
      }

      const result = await authService.updateProfile(updateData);
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (error: any) {
      setMessage({ 
        type: "error", 
        text: error.response?.data?.error || "An error occurred while updating your profile" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    router.push(ROUTES.LOGIN);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">General Information</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Update your platform's general information and settings
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="platform_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Platform Name
                </label>
                <input
                  type="text"
                  id="platform_name"
                  name="platform_name"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                  placeholder="Your Platform Name"
                  defaultValue="Membership Management System"
                />
              </div>

              <div>
                <label htmlFor="platform_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Platform URL
                </label>
                <input
                  type="text"
                  id="platform_url"
                  name="platform_url"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                  placeholder="https://yourdomain.com"
                  defaultValue="https://membership.example.com"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="platform_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Platform Description
                </label>
                <textarea
                  id="platform_description"
                  name="platform_description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                  placeholder="Describe your platform"
                  defaultValue="A comprehensive membership management system for businesses of all sizes."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
              >
                <FiSave className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Settings</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Update your account information and password
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Email cannot be changed. Contact support for assistance.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">Change Password</h3>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={profileData.current_password}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={profileData.new_password}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={profileData.confirm_password}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                />
              </div>
            </div>

            {message.text && (
              <div
                className={`rounded-md p-4 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleProfileSubmit}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : (
                  <>
                    <FiSave className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case "branding":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Branding Settings</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Customize your platform's branding and appearance
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo</label>
                <div className="mt-1 flex items-center space-x-4">
                  <div className="h-16 w-16 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                    <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-500">
                      Logo
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Favicon</label>
                <div className="mt-1 flex items-center space-x-4">
                  <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                    <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-500">
                      Icon
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Primary Color
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 sm:text-sm">
                    #
                  </span>
                  <input
                    type="text"
                    id="primary_color"
                    name="primary_color"
                    className="block w-full flex-1 rounded-none rounded-r-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                    placeholder="0066FF"
                    defaultValue="0066FF"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="secondary_color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Secondary Color
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 sm:text-sm">
                    #
                  </span>
                  <input
                    type="text"
                    id="secondary_color"
                    name="secondary_color"
                    className="block w-full flex-1 rounded-none rounded-r-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                    placeholder="FF9900"
                    defaultValue="FF9900"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="custom_css" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Custom CSS
                </label>
                <textarea
                  id="custom_css"
                  name="custom_css"
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                  placeholder="Enter custom CSS here"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Advanced: Add custom CSS to override default styles
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
              >
                <FiSave className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        );

      case "logout":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Logout</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Sign out of your account
              </p>
            </div>

            <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to log out of your account? You will need to sign in again to access your dashboard.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              This section is under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Platform Settings</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your platform settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <nav className="flex flex-col">
              <button
                onClick={() => setActiveTab("general")}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  activeTab === "general"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                } ${
                  activeTab === "general" ? "" : "border-b border-gray-200 dark:border-gray-700"
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab("account")}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  activeTab === "account"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                } ${
                  activeTab === "account" ? "" : "border-b border-gray-200 dark:border-gray-700"
                }`}
              >
                Account
              </button>
              <button
                onClick={() => setActiveTab("branding")}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  activeTab === "branding"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                } ${
                  activeTab === "branding" ? "" : "border-b border-gray-200 dark:border-gray-700"
                }`}
              >
                Branding
              </button>
              <button
                onClick={() => setActiveTab("billing")}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  activeTab === "billing"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                } ${
                  activeTab === "billing" ? "" : "border-b border-gray-200 dark:border-gray-700"
                }`}
              >
                Billing
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  activeTab === "notifications"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                } ${
                  activeTab === "notifications" ? "" : "border-b border-gray-200 dark:border-gray-700"
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  activeTab === "security"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                } ${
                  activeTab === "security" ? "" : "border-b border-gray-200 dark:border-gray-700"
                }`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab("integrations")}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  activeTab === "integrations"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                } ${
                  activeTab === "integrations" ? "" : "border-b border-gray-200 dark:border-gray-700"
                }`}
              >
                Integrations
              </button>
              <button
                onClick={() => setActiveTab("logout")}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  activeTab === "logout"
                    ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                }`}
              >
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
