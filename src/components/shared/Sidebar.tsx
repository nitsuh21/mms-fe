"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
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
} from "react-icons/fi";
import { cn } from "@/lib/utils";

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
    icon: FiCreditCard,
  },
  {
    title: "Reports",
    href: "reports",
    icon: FiBarChart2,
  },
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

  // Determine if we're in a business context
  const isInBusinessContext = pathname.includes(`/merchant-portal/${merchantId}/businesses/`) && businessId;
  
  // Determine if we're in a platform context
  const isInPlatformContext = pathname.includes(`/merchant-portal/${merchantId}/platform/`);

  // If we're in platform context, don't show the sidebar
  if (isInPlatformContext) {
    return null;
  }

  // Function to check if a link is active
  const isActive = (href: string) => {
    if (isInBusinessContext && !href.startsWith("platform/")) {
      const fullPath = `/merchant-portal/${merchantId}/businesses/${businessId}/${href}`;
      return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
    } else {
      const fullPath = `/merchant-portal/${merchantId}/${href}`;
      return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
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

  return (
    <div className="flex h-full flex-col gap-y-5 border-r border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex h-16 shrink-0 items-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">MMS</h1>
      </div>

      {isInBusinessContext ? (
        // Business context header
        <div className="border-b border-gray-200 px-2 pb-4 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {businessId.includes("fitness") ? "Fitness Studio" :
             businessId.includes("yoga") ? "Yoga Center" :
             businessId.includes("dance") ? "Dance Academy" : 
             businessId}
          </h2>
          <Link
            href={`/merchant-portal/${merchantId}/dashboard`}
            className="mt-2 flex items-center text-sm text-gray-600 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-500"
          >
            <FiHome className="mr-1 h-4 w-4" />
            Back to Merchant Dashboard
          </Link>
        </div>
      ) : (
        // Merchant context header
        <div className="border-b border-gray-200 px-2 pb-4 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Merchant Portal
          </h2>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {/* Business or Merchant Navigation */}
        <div className="space-y-1">
          {isInBusinessContext ? (
            // Business Management Navigation
            businessNavItems.map((item) => (
              <Link
                key={item.href}
                href={getHref(item.href)}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.title}
              </Link>
            ))
          ) : (
            // Merchant Navigation
            merchantNavItems.map((item) => (
              <Link
                key={item.href}
                href={getHref(item.href)}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.title}
              </Link>
            ))
          )}
        </div>
      </nav>

      {/* Platform section - always visible */}
      <div className="border-b border-gray-200 pt-2 px-2 pb-4 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Platform
        </h2>
      </div>

      <nav>
        <div className="space-y-1">
          {platformNavItems.map((item) => (
            <Link
              key={item.href}
              href={`/merchant-portal/${merchantId}/${item.href}`}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === `/merchant-portal/${merchantId}/${item.href}` || 
                pathname.startsWith(`/merchant-portal/${merchantId}/${item.href}/`)
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                  : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.title}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
