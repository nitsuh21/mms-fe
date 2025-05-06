'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { NotificationProvider, NotificationContainer } from '@/context/NotificationContext';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SidebarProvider>
          <NotificationProvider>
            {children}
            <NotificationContainer />
            <Toaster richColors position="top-right" />
          </NotificationProvider>
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
