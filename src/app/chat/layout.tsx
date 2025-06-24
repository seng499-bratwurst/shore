import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar/sidebar';
import { ChatHistorySidebar } from '@/features/chat-history/components/chat-history-sidebar';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ChatHistorySidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
