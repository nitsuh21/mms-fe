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

  const handleLogout = async () => {
    try {
      await authService.signout();
      // Clear local storage
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      // Redirect to login page
      router.push(ROUTES.LOGIN);
    } catch (error) {
      console.error("Logout failed:", error);
      setMessage({ 
        type: "error", 
        text: "Logout failed. Please try again." 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Platform Settings</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Configure platform-wide settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Settings Tabs */}
        <div className="col-span-12 md:col-span-3">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
              <h2 className="font-medium text-black dark:text-white">Settings</h2>
            </div>
            <div className="flex flex-col p-6">
              <button
                className={`mb-2 rounded-lg px-4 py-2 text-left transition-colors ${
                  activeTab === "general"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
                onClick={() => setActiveTab("general")}
              >
                General
              </button>
              <button
                className={`mb-2 rounded-lg px-4 py-2 text-left transition-colors ${
                  activeTab === "account"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
                onClick={() => setActiveTab("account")}
              >
                Account
              </button>
              <button
                className={`mb-2 rounded-lg px-4 py-2 text-left transition-colors ${
                  activeTab === "branding"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
                onClick={() => setActiveTab("branding")}
              >
                Branding
              </button>
              <button
                className={`mb-2 rounded-lg px-4 py-2 text-left transition-colors ${
                  activeTab === "billing"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
                onClick={() => setActiveTab("billing")}
              >
                Billing & Payments
              </button>
              <button
                className={`mb-2 rounded-lg px-4 py-2 text-left transition-colors ${
                  activeTab === "notifications"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
                onClick={() => setActiveTab("notifications")}
              >
                Notifications
              </button>
              <button
                className={`mb-2 rounded-lg px-4 py-2 text-left transition-colors ${
                  activeTab === "security"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
                onClick={() => setActiveTab("security")}
              >
                Security
              </button>
              <button
                className={`mb-2 rounded-lg px-4 py-2 text-left transition-colors ${
                  activeTab === "integrations"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
                onClick={() => setActiveTab("integrations")}
              >
                Integrations
              </button>
              <button
                className={`mb-2 rounded-lg px-4 py-2 text-left transition-colors ${
                  activeTab === "logout"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
                onClick={() => setActiveTab("logout")}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="col-span-12 md:col-span-9">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
              <h2 className="font-medium text-black dark:text-white">
                {activeTab === "general" && "General Settings"}
                {activeTab === "account" && "Account Management"}
                {activeTab === "branding" && "Branding Settings"}
                {activeTab === "billing" && "Billing & Payments"}
                {activeTab === "notifications" && "Notification Settings"}
                {activeTab === "security" && "Security Settings"}
                {activeTab === "integrations" && "Integrations"}
                {activeTab === "logout" && "Logout"}
              </h2>
            </div>
            <div className="p-6">
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter platform name"
                      defaultValue="Membership Management System"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Platform URL
                    </label>
                    <input
                      type="text"
                      placeholder="Enter platform URL"
                      defaultValue="https://mms.example.com"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Support Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter support email"
                      defaultValue="support@mms.example.com"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Default Language
                    </label>
                    <select className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Default Timezone
                    </label>
                    <select className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time (EST)</option>
                      <option value="CST">Central Time (CST)</option>
                      <option value="MST">Mountain Time (MST)</option>
                      <option value="PST">Pacific Time (PST)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div className="space-y-6">
                  {message.text && (
                    <div className={`p-4 rounded-md ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                      {message.text}
                    </div>
                  )}
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      placeholder="Enter first name"
                      value={profileData.first_name}
                      onChange={handleProfileChange}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      placeholder="Enter last name"
                      value={profileData.last_name}
                      onChange={handleProfileChange}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email address"
                      value={profileData.email}
                      disabled
                      className="w-full rounded border-[1.5px] border-stroke bg-gray-100 px-5 py-3 font-medium outline-none transition disabled:cursor-not-allowed dark:border-form-strokedark dark:bg-form-input"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
                  </div>
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter phone number"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div className="border-t border-stroke pt-6 mt-6">
                    <h3 className="text-lg font-medium mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2.5 block font-medium text-black dark:text-white">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="current_password"
                          placeholder="Enter current password"
                          value={profileData.current_password}
                          onChange={handleProfileChange}
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="mb-2.5 block font-medium text-black dark:text-white">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="new_password"
                          placeholder="Enter new password"
                          value={profileData.new_password}
                          onChange={handleProfileChange}
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="mb-2.5 block font-medium text-black dark:text-white">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          name="confirm_password"
                          placeholder="Confirm new password"
                          value={profileData.confirm_password}
                          onChange={handleProfileChange}
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleProfileSubmit}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "branding" && (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">
                    Branding settings will be implemented here
                  </p>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">
                    Billing & payment settings will be implemented here
                  </p>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">
                    Notification settings will be implemented here
                  </p>
                </div>
              )}

              {activeTab === "security" && (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">
                    Security settings will be implemented here
                  </p>
                </div>
              )}

              {activeTab === "integrations" && (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">
                    Integration settings will be implemented here
                  </p>
                </div>
              )}

              {activeTab === "logout" && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Logout from your account
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      You are about to log out from your account. You will need to sign in again to access your account.
                    </p>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-danger-dark"
                    >
                      <FiSave className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600">
                  <FiSave className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
