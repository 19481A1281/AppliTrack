'use client';

import { HeroUIProvider } from '@heroui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { useState } from 'react';

function HeroUIWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return <HeroUIProvider className={theme}>{children}</HeroUIProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 1000 * 30, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <HeroUIWrapper>
          <AppProvider>{children}</AppProvider>
        </HeroUIWrapper>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
