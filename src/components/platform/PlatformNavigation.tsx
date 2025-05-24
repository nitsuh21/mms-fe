"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import {
  FiGrid,
  FiBriefcase,
  FiUserPlus,
  FiPieChart,
  FiActivity,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import NotificationDropdown from "@/components/shared/NotificationDropdown";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const platformNavItems: NavItem[] = [
  {
    title: "Overview",
    href: "dashboard",
    icon: FiGrid,
  },
  {
    title: "Businesses",
    href: "businesses",
    icon: FiBriefcase,
  },
  // {
  //   title: "Teams",
  //   href: "teams",
  //   icon: FiUserPlus,
  // },
  // {
  //   title: "Analytics",
  //   href: "reports",
  //   icon: FiPieChart,
  // },
  // {
  //   title: "Settings",
  //   href: "settings",
  //   icon: FiActivity,
  // },
];

export default function PlatformNavigation() {
  const pathname = usePathname();
  const params = useParams();
  const merchantId = params?.merchantId as string;

  // Function to check if a link is active
  const isActive = (href: string) => {
    const fullPath = `/merchant-portal/${merchantId}/platform/${href}`;
    return pathname === fullPath || pathname?.startsWith(`${fullPath}/`);
  };

  // Function to generate the correct href
  const getHref = (href: string) => {
    return `/merchant-portal/${merchantId}/platform/${href}`;
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="flex items-center justify-between py-4">
        <div className="flex space-x-4 overflow-x-auto">
        {platformNavItems.map((item) => (
          <Link
            key={item.href}
            href={getHref(item.href)}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400"
                : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            )}
          >
            <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
            {item.title}
          </Link>
        ))}
        </div>
        <div className="flex items-center">
          <NotificationDropdown />
        </div>
      </nav>
    </div>
  );
}
