"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BusinessSwitcher } from "@/components/common/BusinessSwitcher";
import { useTheme } from "@/context/ThemeContext";
import { FiMoon, FiSun, FiBell, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { useAuth } from "@/lib/auth/rbac";
import { authService } from "@/services/authService";
import { useParams } from "next/navigation";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, ROUTES } from "@/config";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const merchantId = params.merchantId as string;
  const { user } = useAuth();

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.signout();
      // Redirect to login page
      router.push(ROUTES.LOGIN);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-gray-900 dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-4">
          <BusinessSwitcher />
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === "dark" ? (
              <FiSun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <FiMoon className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative flex h-8.5 w-8.5 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <FiBell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-xs font-medium text-white dark:bg-brand-400">
              4
            </span>
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button 
              className="flex h-8.5 w-8.5 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <FiUser className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-60 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  
                  <Link
                    href={`/merchant-portal/${merchantId}/platform/settings?tab=account`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiUser className="mr-2 h-4 w-4" />
                    My Account
                  </Link>
                  
                  <Link
                    href={`/merchant-portal/${merchantId}/platform/settings`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiSettings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                  
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={handleLogout}
                  >
                    <FiLogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
