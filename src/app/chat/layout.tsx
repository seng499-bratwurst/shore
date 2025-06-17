import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar/sidebar"
import { AppSidebar } from "@/components/ui/sidebar/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
<SidebarProvider>
      <div className="flex min-h-screen">
        <div className="hidden md:block ">
          <AppSidebar  />
        </div>
        <div className="flex-1 flex flex-col w-screen">
          <SidebarTrigger />
          <main className="flex-1 ">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}