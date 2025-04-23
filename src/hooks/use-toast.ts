import { useCallback } from 'react';

export interface ToastOptions {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

type Toast = (options: ToastOptions) => void;

const defaultToast: Toast = (options) => {
  // For now, just log to console
  console.log(`[${options.variant || 'default'}] ${options.title}: ${options.description}`);
};

export const useToast = () => {
  const toast = useCallback<Toast>((options) => {
    defaultToast(options);
  }, []);

  return { toast };
};
