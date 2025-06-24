'use client';

import { Button } from '@/components/ui/button/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar/sidebar';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useListConversations } from '../api/list-conversations';

export function ChatHistorySidebar() {
  const { data: conversations = [] } = useListConversations();

  return (
    <Sidebar side="left">
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <Link href="/chat">
            <Button variant="link" className="text-muted-foreground hover:text-foreground">
              <Plus size={16} />
            </Button>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarInput placeholder="Search" className="mb-2" />
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.map((conversation) => (
                <SidebarMenuItem key={conversation.id}>
                  <SidebarMenuButton asChild>
                    <Link
                      className="text-neutral-900 dark:text-neutral-50"
                      href={`/chat/${conversation.id}`}
                    >
                      <span>chat with id {conversation.id}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
