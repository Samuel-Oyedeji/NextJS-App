// src/components/ClientLayout.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRenderLoading, setShouldRenderLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setShouldRenderLoading(true);
    const showTimer = setTimeout(() => {
      setIsLoading(false);
      const hideTimer = setTimeout(() => setShouldRenderLoading(false), 500);
      return () => clearTimeout(hideTimer);
    }, 1000);
    return () => clearTimeout(showTimer);
  }, [pathname]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsLoading(true);
      setShouldRenderLoading(true);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <>
      {shouldRenderLoading && <LoadingScreen />}
      {!isLoading && children}
    </>
  );
}