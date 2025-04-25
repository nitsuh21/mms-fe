"use client";

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiXCircle, FiX } from 'react-icons/fi';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

interface NotificationState {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

interface RemoveNotificationPayload {
  id: string;
}

interface NotificationAction {
  type: 'ADD_NOTIFICATION' | 'REMOVE_NOTIFICATION';
  payload: NotificationState | RemoveNotificationPayload;
}

interface NotificationContextType {
  showNotification: (notification: { type: string; title: string; message: string }) => void;
  notifications: Notification[];
  addNotification: (notification: NotificationState) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const notificationReducer = (state: Notification[], action: NotificationAction): Notification[] => {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const payload = action.payload as NotificationState;
      const notification = {
        id: crypto.randomUUID(),
        type: payload.type,
        title: payload.title,
        message: payload.message,
        duration: payload.duration,
      };
      return [...state, notification];
    }
    case 'REMOVE_NOTIFICATION': {
      const payload = action.payload as RemoveNotificationPayload;
      return state.filter((n) => n.id !== payload.id);
    }
    default:
      return state;
  }
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, dispatch] = useReducer(notificationReducer, []);

  const addNotification = useCallback((notification: NotificationState) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id } });
  }, []);

  const showNotification = useCallback((notification: { type: string; title: string; message: string }) => {
    addNotification(notification as NotificationState);
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, showNotification }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <FiAlertCircle className="w-4 h-4 text-red-500" />;
      case 'info':
        return <FiInfo className="w-4 h-4 text-blue-500" />;
      case 'warning':
        return <FiXCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] w-full max-w-sm px-4 py-2" style={{
      animation: 'slideIn 0.3s ease-out',
      animationFillMode: 'forwards',
    }}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-center rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800 transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20'
              : notification.type === 'error'
              ? 'bg-red-50 dark:bg-red-900/20'
              : notification.type === 'warning'
              ? 'bg-yellow-50 dark:bg-yellow-900/20'
              : 'bg-blue-50 dark:bg-blue-900/20'
          }`}
          style={{
            animation: 'slideIn 0.3s ease-out',
            animationFillMode: 'forwards',
          }}
        >
          {getIcon(notification.type)}
          <div className="flex-1 ml-3">
            <h3 className="font-medium text-gray-900 dark:text-white">{notification.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="p-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
