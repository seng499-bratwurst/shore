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
} from '@/components/ui/sidebar/sidebar';
import { Plus, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useListConversations } from '../api/list-conversations';
import { ConversationItem } from './conversation-item';

export function ChatHistorySidebar() {
  const { data: conversations = [] } = useListConversations();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }

    const query = searchQuery.toLowerCase().trim();
    return conversations.filter((conversation) => {
      const title = conversation.title || `Chat ${conversation.id}`;
      return title.toLowerCase().includes(query);
    });
  }, [conversations, searchQuery]);

  const performSearch = () => {
    // Search is performed in real-time via filteredConversations
    // This function can be used for additional search actions if needed
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Sidebar side="left">
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Conversations</h2>
          <Link href="/chat">
            <Button variant="link" className="text-muted-foreground hover:text-foreground">
              <Plus size={16} />
            </Button>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* Enhanced Search Input */}
          <div className="relative mb-2">
            <SidebarInput
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={handleSearchKeyDown}
              className="pr-16" // Make room for the search and clear buttons
            />
            
            {/* Search Button - shows on focus/hover or when there's a query */}
            {(isSearchFocused || searchQuery) && (
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={clearSearch}
                    title="Clear Search"
                  >
                    <X size={12} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted"
                  onClick={handleSearchSubmit}
                  title="Search Conversations"
                >
                  <Search size={12} />
                </Button>
              </div>
            )}
          </div>

          <SidebarGroupLabel>
            {searchQuery ? `Conversations (${filteredConversations.length} found)` : 'Conversations'}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <ConversationItem 
                    key={conversation.id} 
                    conversation={conversation} 
                  />
                ))
              ) : (
                <div className="px-2 py-4 text-xs text-muted-foreground text-center">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
