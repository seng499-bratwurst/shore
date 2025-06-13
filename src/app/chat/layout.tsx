import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar/sidebar"
import { AppSidebar } from "@/components/ui/sidebar/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className='flex min-h screen relative'>
        <div >
          <AppSidebar />
        </div>
        <div >
          <div >
            <h1>Chat Section <SidebarTrigger /></h1>            
          </div>
          <main className="p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}