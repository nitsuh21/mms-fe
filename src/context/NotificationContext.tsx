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

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function notificationReducer(state: Notification[], action: NotificationAction): Notification[] {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return [...state, { ...action.payload, id: Date.now().toString() }];
    case 'REMOVE_NOTIFICATION':
      return state.filter((notification) => notification.id !== action.payload);
    default:
      return state;
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, dispatch] = useReducer(notificationReducer, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      if (notification.duration !== 0) {
        setTimeout(() => {
          removeNotification(Date.now().toString());
        }, notification.duration || 5000);
      }
    },
    [removeNotification]
  );

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <FiXCircle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <FiAlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'info':
        return <FiInfo className="h-5 w-5 text-blue-400" />;
    }
  };

  const getStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex w-96 items-start gap-3 rounded-lg border p-4 shadow-lg ${getStyles(
            notification.type
          )}`}
        >
          {getIcon(notification.type)}
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {notification.title}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
