'use client';

import { ResizableSidebar } from '@/components/ui/resizable-panel/resizable-panel';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar/sidebar';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { ChatHistorySidebar } from '@/features/chat-history/components/chat-history-sidebar';
import { ReactFlowProvider } from '@xyflow/react';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuthStore();

  if (!isLoggedIn) return <ReactFlowProvider>{children}</ReactFlowProvider>;

  return (
    <ReactFlowProvider>
      <SidebarProvider>
        <ResizableSidebar defaultWidth={256} minWidth={200} maxWidth={400}>
          <ChatHistorySidebar />
        </ResizableSidebar>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </ReactFlowProvider>
  );
}
