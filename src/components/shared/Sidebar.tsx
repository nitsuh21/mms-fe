"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiHome,
  FiUsers,
  FiCreditCard,
  FiBarChart2,
  FiSettings,
  FiBriefcase,
  FiUserPlus,
  FiPieChart,
  FiGrid,
  FiActivity,
  FiList,
  FiTag,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiFileText,
  FiPackage,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const merchantNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "dashboard",
    icon: FiHome,
  },
  {
    title: "Businesses",
    href: "businesses",
    icon: FiBriefcase,
  },
  {
    title: "Settings",
    href: "settings",
    icon: FiSettings,
  },
];

const businessNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "dashboard",
    icon: FiHome,
  },
  {
    title: "Members",
    href: "members",
    icon: FiUsers,
  },
  {
    title: "Plans",
    href: "plans",
    icon: FiList,
  },
  {
    title: "Discounts & Promos",
    href: "discounts",
    icon: FiTag,
  },
  {
    title: "Subscriptions",
    href: "subscriptions",
    icon: FiPackage,
  },
  {
    title: "Invoices",
    href: "invoices",
    icon: FiFileText,
  },
  // {
  //   title: "Reports",
  //   href: "reports",
  //   icon: FiBarChart2,
  // },
  {
    title: "Settings",
    href: "settings",
    icon: FiSettings,
  },
];

const platformNavItems: NavItem[] = [
  {
    title: "Overview",
    href: "platform/dashboard",
    icon: FiGrid,
  },
  {
    title: "Businesses",
    href: "platform/businesses",
    icon: FiBriefcase,
  },
  {
    title: "Teams",
    href: "platform/teams",
    icon: FiUserPlus,
  },
  {
    title: "Analytics",
    href: "platform/reports",
    icon: FiPieChart,
  },
  {
    title: "Platform Settings",
    href: "platform/settings",
    icon: FiActivity,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const merchantId = params?.merchantId as string;
  const businessId = params?.businessId as string;
  const { isExpanded, isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Set initial mobile state
    setIsMobile(window.innerWidth < 768);

    // Add resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if we're in a business context
  const isInBusinessContext = pathname?.includes(`/merchant-portal/${merchantId}/businesses/`) && businessId;
  
  // Determine if we're in a platform context
  const isInPlatformContext = pathname?.includes(`/merchant-portal/${merchantId}/platform/`);

  // If we're in platform context, don't show the sidebar
  if (isInPlatformContext) {
    return null;
  }

  // Function to check if a link is active
  const isActive = (href: string) => {
    if (isInBusinessContext && !href.startsWith("platform/")) {
      const fullPath = `/merchant-portal/${merchantId}/businesses/${businessId}/${href}`;
      return pathname === fullPath || pathname?.startsWith(`${fullPath}/`);
    } else {
      const fullPath = `/merchant-portal/${merchantId}/${href}`;
      return pathname === fullPath || pathname?.startsWith(`${fullPath}/`);
    }
  };

  // Function to generate the correct href based on context
  const getHref = (href: string) => {
    if (isInBusinessContext && !href.startsWith("platform/")) {
      return `/merchant-portal/${merchantId}/businesses/${businessId}/${href}`;
    } else {
      return `/merchant-portal/${merchantId}/${href}`;
    }
  };

  // Function to handle link clicks - close mobile sidebar
  const handleLinkClick = () => {
    if (isMobile) {
      toggleMobileSidebar();
    }
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-30 z-40 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-50 flex h-full flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 transition-all duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isExpanded ? "md:w-64" : "md:w-20"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          <h1 className={cn(
            "text-xl font-semibold text-gray-900 dark:text-white transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0 md:opacity-100 md:text-sm"
          )}>
            MMS
          </h1>
          
          {/* Close button for mobile */}
          <button 
            onClick={toggleMobileSidebar}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FiX className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          
          {/* Toggle button for desktop */}
          <button 
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isExpanded ? (
              <FiChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <FiChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>

        {isInBusinessContext ? (
          // Business context header
          <div className={cn(
            "border-b border-gray-200 px-2 pb-4 dark:border-gray-700",
            !isExpanded && "text-center"
          )}>
            <h2 className={cn(
              "text-lg font-medium text-gray-900 dark:text-white",
              !isExpanded && "hidden md:block md:text-xs md:mt-2"
            )}>
              
            </h2>
            {isMobile && (
              <button
                onClick={() => {
                  window.location.href = `/merchant-portal/${merchantId}/platform/dashboard`;
                  toggleMobileSidebar();
                }}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <FiChevronLeft className="h-5 w-5" />
                Back to Merchant Dashboard
              </button>
            )}
            {!isMobile && (
              <Link
                href={`/merchant-portal/${merchantId}/platform/dashboard`}
                className={cn(
                  "mt-2 flex items-center text-sm text-gray-600 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-500",
                  !isExpanded && "hidden md:hidden"
                )}
              >
                <FiHome className="mr-1 h-4 w-4" />
                Back to Merchant Dashboard
              </Link>
            )}
          </div>
        ) : (
          // Merchant context header
          <div className={cn(
            "border-b border-gray-200 px-2 pb-4 dark:border-gray-700",
            !isExpanded && "text-center"
          )}>
            <h2 className={cn(
              "text-lg font-medium text-gray-900 dark:text-white",
              !isExpanded && "hidden md:block md:text-xs md:mt-2"
            )}>
              Merchant Portal
            </h2>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
          {/* Business or Merchant Navigation */}
          <div className="space-y-1">
            {isInBusinessContext ? (
              // Business Management Navigation
              businessNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={getHref(item.href)}
                  onClick={handleLinkClick}
                  className={cn(
                    "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800",
                    !isExpanded && "md:justify-center"
                  )}
                  title={!isExpanded ? item.title : ""}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    (isExpanded || isMobile) ? "mr-3" : "mr-0"
                  )} />
                  <span className={cn(
                    "transition-opacity duration-300",
                    (isExpanded || isMobile) ? "opacity-100" : "opacity-0 md:hidden"
                  )}>
                    {item.title}
                  </span>
                </Link>
              ))
            ) : (
              // Merchant Navigation
              merchantNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={getHref(item.href)}
                  onClick={handleLinkClick}
                  className={cn(
                    "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800",
                    !isExpanded && "md:justify-center"
                  )}
                  title={!isExpanded ? item.title : ""}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    (isExpanded || isMobile) ? "mr-3" : "mr-0"
                  )} />
                  <span className={cn(
                    "transition-opacity duration-300",
                    (isExpanded || isMobile) ? "opacity-100" : "opacity-0 md:hidden"
                  )}>
                    {item.title}
                  </span>
                </Link>
              ))
            )}
          </div>
        </nav>

        {/* Platform section - always visible */}
        <div className={cn(
          "border-b border-gray-200 pt-2 px-2 pb-4 dark:border-gray-700",
          !isExpanded && "text-center"
        )}>
          <h2 className={cn(
            "text-lg font-medium text-gray-900 dark:text-white",
            !isExpanded && "hidden md:block md:text-xs md:mt-2"
          )}>
            Platform
          </h2>
        </div>
{/* 
        <nav className="py-4 px-2">
          <div className="space-y-1">
            {platformNavItems.map((item) => (
              <Link
                key={item.href}
                href={`/merchant-portal/${merchantId}/${item.href}`}
                onClick={handleLinkClick}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === `/merchant-portal/${merchantId}/${item.href}` || 
                  pathname.startsWith(`/merchant-portal/${merchantId}/${item.href}/`)
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800",
                  !isExpanded && "md:justify-center"
                )}
                title={!isExpanded ? item.title : ""}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  (isExpanded || isMobile) ? "mr-3" : "mr-0"
                )} />
                <span className={cn(
                  "transition-opacity duration-300",
                  (isExpanded || isMobile) ? "opacity-100" : "opacity-0 md:hidden"
                )}>
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
        </nav> */}
      </div>
    </>
  );
}
