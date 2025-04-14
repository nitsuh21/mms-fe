"use client";

import React, { useState } from 'react';
import { useNotification } from '@/context/NotificationContext';

interface NotificationProps {
  notification: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
  };
}

const NotificationItem: React.FC<NotificationProps> = ({ notification }) => {
  const { markAsRead } = useNotification();

  const getColorClass = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
    }
  };

  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg ${getColorClass()} text-white transition-all duration-300 hover:opacity-90 cursor-pointer`}
      onClick={() => markAsRead(notification.id)}
      role="alert"
    >
      <div>
        <h3 className="font-semibold">{notification.title}</h3>
        <p className="text-sm">{notification.message}</p>
        <p className="text-xs text-gray-200">{new Date(notification.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
};

export const Notification: React.FC = () => {
  const { notifications, unreadCount, fetchNotifications } = useNotification();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSeeAll = () => {
    // Navigate to notifications page
  };

  const lastFiveNotifications = notifications.slice(0, 5);

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1 relative"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Recent Notifications</h3>
            {lastFiveNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
            <button
              onClick={handleSeeAll}
              className="w-full text-center py-2 text-blue-600 hover:text-blue-800"
            >
              See All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
