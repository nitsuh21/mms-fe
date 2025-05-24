"use client";

import { useParams } from 'next/navigation';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Platform Management</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage platform settings and configurations
          </p>
        </div>
      </div>
      
      {children}
    </div>
  );
}
