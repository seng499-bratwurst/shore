import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar/sidebar';
import { ResizableSidebar } from '@/components/ui/resizable-panel/resizable-panel';
import { ChatHistorySidebar } from '@/features/chat-history/components/chat-history-sidebar';
import { ReactFlowProvider } from '@xyflow/react';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ReactFlowProvider>
      <SidebarProvider>
        <ResizableSidebar 
          defaultWidth={256} 
          minWidth={200} 
          maxWidth={400}
        >
          <ChatHistorySidebar />
        </ResizableSidebar>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </ReactFlowProvider>
  );
}
