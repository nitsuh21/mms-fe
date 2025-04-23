import { type ToastOptions } from '@/context/ToastContext';

// Simple console-based toast for now
export const toast = (options: ToastOptions) => {
  console.log(`[${options.variant || 'default'}] ${options.title}: ${options.description}`);
};

export type { ToastOptions };
