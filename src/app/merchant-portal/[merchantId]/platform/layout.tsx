"use client";

import PlatformNavigation from '@/components/platform/PlatformNavigation';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6 p-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">General Management</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Get an overview of all of your workspaces.
          </p>
        </div>
      </div>
      
      <PlatformNavigation />
      
      {children}
    </div>
  );
}
