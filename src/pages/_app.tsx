import { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AuthProvider>
      {mounted ? <Component {...pageProps} /> : null}
    </AuthProvider>
  );
}

export default MyApp; 