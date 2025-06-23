import { AppSidebar } from '@/components/ui/sidebar/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar/sidebar';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <div className="hidden md:block ">
          <AppSidebar />
        </div>
        <div className="flex-1 flex flex-col w-screen">
          <SidebarTrigger />
          <main className="h-[calc(100vh-64px)]">{children}</main>;
        </div>
      </div>
    </SidebarProvider>
  );
}
