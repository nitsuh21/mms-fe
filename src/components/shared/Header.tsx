"use client";

import { BusinessSwitcher } from "@/components/common/BusinessSwitcher";
import { useTheme } from "@/context/ThemeContext";
import { FiMoon, FiSun, FiBell, FiUser } from "react-icons/fi";

const Header = () => {
  const { theme, toggleTheme } = useTheme();

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
          <button className="flex h-8.5 w-8.5 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <FiUser className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
