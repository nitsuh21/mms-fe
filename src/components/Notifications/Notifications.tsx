import React, { useState, useEffect } from 'react';
import { Notification, NotificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface NotificationsProps {
  onNotificationClick?: (notification: Notification) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onNotificationClick }) => {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  const notificationService = new NotificationService(api);

  const {
    data: notifications,
    isLoading,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-4">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">Notifications</h2>
      {notifications?.length === 0 ? (
        <p className="text-gray-500">No notifications yet</p>
      ) : (
        <div className="space-y-3">
          {notifications?.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg cursor-pointer ${
                notification.is_read ? 'bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
                {!notification.is_read && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    New
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
