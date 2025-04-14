"use client";

import React, { useState, useEffect } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { Notification } from '@/components/shared/Notification';
import { useAuth } from '@/context/AuthContext';

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, fetchNotifications } = useNotification();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'business'>('all');
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getFilteredNotifications = () => {
    let filtered = [...notifications];
    
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    }

    if (businessId) {
      filtered = filtered.filter(n => n.business_id === businessId);
    }

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const handleBusinessSelect = (id: string) => {
    setBusinessId(id);
    setActiveTab('business');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'all' ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
            onClick={() => {
              setBusinessId(null);
              setActiveTab('all');
            }}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'unread' ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
            onClick={() => {
              setBusinessId(null);
              setActiveTab('unread');
            }}
          >
            Unread ({unreadCount})
          </button>
          {user?.businesses?.length > 0 && (
            <select
              className="px-4 py-2 rounded-lg border border-gray-300"
              value={businessId || ''}
              onChange={(e) => handleBusinessSelect(e.target.value)}
            >
              <option value="">All Businesses</option>
              {user.businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {getFilteredNotifications().map((notification) => (
          <Notification
            key={notification.id}
            notification={notification}
          />
        ))}
      </div>

      {getFilteredNotifications().length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No notifications found
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
