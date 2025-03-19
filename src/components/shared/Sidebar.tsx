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
  const businessId = params?.businessId as string;

  const isActive = (href: string) => {
    const fullPath = `/merchant-portal/${businessId}/${href}`;
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  return (
    <div className="flex h-full flex-col gap-y-5 border-r border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex h-16 shrink-0 items-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">MMS</h1>
      </div>

      <div className="border-b border-gray-200 px-2 pb-4 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {businessId === "1" ? "Fitness Studio" :
           businessId === "2" ? "Yoga Center" :
           businessId === "3" ? "Dance Academy" : "Business"}
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {/* Business Management */}
        <div className="space-y-1">
          {businessNavItems.map((item) => (
            <Link
              key={item.href}
              href={`/merchant-portal/${businessId}/${item.href}`}
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
          ))}
        </div>
      </nav>


       

       <div className="border-b border-gray-200 pt-2 px-2 pb-4 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            General
          </h2>
        </div>

        <nav>
          {/* Platform Management */}
        <div className="space-y-1">
          {platformNavItems.map((item) => (
            <Link
              key={item.href}
              href={`/merchant-portal/${businessId}/${item.href}`}
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
          ))}
        </div>
        </nav>

        
    </div>
  );
}
