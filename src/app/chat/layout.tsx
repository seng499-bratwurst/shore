'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar/sidebar';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { ChatHistorySidebar } from '@/features/chat-history/components/chat-history-sidebar';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuthStore();

  if (!isLoggedIn) return children;

  return (
    <SidebarProvider>
      <ChatHistorySidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
