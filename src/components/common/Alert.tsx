'use client'

import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, XMarkIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface AlertProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'success';
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isProcessing?: boolean;
  disableActions?: boolean;
}

export default function Alert({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  onConfirm,
  onCancel,
  isProcessing = false,
  disableActions = false,
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        if (isMounted) setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMounted]);

  if (!isVisible) return null;

  const typeStyles = {
    danger: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      icon: 'text-red-400 dark:text-red-300',
      iconComponent: <ExclamationTriangleIcon className="h-6 w-6" />,
      confirm: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      icon: 'text-yellow-400 dark:text-yellow-300',
      iconComponent: <ExclamationTriangleIcon className="h-6 w-6" />,
      confirm: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 dark:bg-yellow-700 dark:hover:bg-yellow-800',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      icon: 'text-green-400 dark:text-green-300',
      iconComponent: <CheckCircleIcon className="h-6 w-6" />,
      confirm: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800',
    },
  };

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      // Error handling can be added here if needed
      console.error('Alert action failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg ${isOpen ? 'animate-fade-in' : 'animate-fade-out'}`}>
          <div className={`${typeStyles[type].bg} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${typeStyles[type].icon} sm:mx-0 sm:h-10 sm:w-10`}>
                {isProcessing ? (
                  <ArrowPathIcon className="h-6 w-6 animate-spin" />
                ) : (
                  typeStyles[type].iconComponent
                )}
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-800">
            <button
              type="button"
              disabled={isProcessing || disableActions}
              className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${typeStyles[type].confirm} ${(isProcessing || disableActions) ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={handleConfirm}
            >
              {isProcessing ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
            <button
              type="button"
              disabled={isProcessing || disableActions}
              className={`mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 ${(isProcessing || disableActions) ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={onCancel}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}