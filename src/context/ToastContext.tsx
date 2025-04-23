'use client';

import React, { createContext, useContext, useCallback } from 'react';

export interface ToastOptions {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useCallback((options: ToastOptions) => {
    // For now, just log to console
    console.log(`[${options.variant || 'default'}] ${options.title}: ${options.description}`);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
