import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar/sidebar';
import { ChatHistorySidebar } from '@/features/chat-history/components/chat-history-sidebar';
import { ReactFlowProvider } from '@xyflow/react';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ReactFlowProvider>
      <SidebarProvider>
        <ChatHistorySidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </ReactFlowProvider>
  );
}
