import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [shouldRender, setShouldRender] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && isMounted && typeof window !== 'undefined') {
      if (!isAuthenticated) {
        window.location.replace('/login');
        return;
      }

      if (user) {
        const currentPath = window.location.pathname;
        if (['/dashboard', '/'].includes(currentPath)) {
          window.location.replace(`/merchant-portal/${user.id}/platform/dashboard`);
        } else {
          setShouldRender(true);
        }
      }
    }
  }, [isLoading, isAuthenticated, isMounted, user]);

  if (!isMounted || isLoading || !shouldRender) {
    return null;
  }

  return isAuthenticated ? <>{children}</> : null;
} 