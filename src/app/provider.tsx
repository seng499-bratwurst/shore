'use client';

import { useAuthStore } from '@/features/auth/stores/auth-store';
import { usePrevious } from '@/hooks/use-previous';
import { queryClient } from '@/lib/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isHydrating } = useAuthStore();
  const prevIsLoggedIn = usePrevious(isLoggedIn);
  const router = useRouter();

  console.log('Layout rendered', { prevIsLoggedIn, isLoggedIn, isHydrating });

  React.useEffect(() => {
    if (prevIsLoggedIn && !isLoggedIn && !isHydrating) {
      router.replace('/');
    }
  }, [isLoggedIn, isHydrating, prevIsLoggedIn]);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
