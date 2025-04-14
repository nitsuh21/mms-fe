'use client';

import {
  NotificationProvider,
  AuthProvider,
  ThemeProvider,
  SidebarProvider
} from '@/context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AuthProvider>
        <ThemeProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </AuthProvider>
    </NotificationProvider>
  );
} 