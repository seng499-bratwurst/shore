'use client';

import { Button } from '@/components/ui/button/button';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar/sidebar';
import { Edit2, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Conversation } from '../../graph-chat/types/conversation';
import { DeleteConversationModal } from './delete-conversation-modal';
import { EditTitleModal } from './edit-title-modal';

interface ConversationItemProps {
  conversation: Conversation;
}

export function ConversationItem({ conversation }: ConversationItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const displayTitle = conversation.title || `Chat ${conversation.id}`;

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking edit button
    e.stopPropagation(); // Prevent event bubbling
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking delete button
    e.stopPropagation(); // Prevent event bubbling
    setIsDeleteModalOpen(true);
  };

  return (
    <>
      <SidebarMenuItem 
        key={conversation.id}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group"
      >
        <SidebarMenuButton asChild>
          <Link
            className="text-neutral-900 dark:text-neutral-50 pr-12 text-xs" // Changed to text-xs for extra small font size
            href={`/chat/${conversation.id}`}
          >
            <span className="truncate text-xs">{displayTitle}</span>
          </Link>
        </SidebarMenuButton>
        
        {/* Action buttons - show on hover */}
        {isHovered && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
              onClick={handleEditClick}
              title="Edit conversation title"
            >
              <Edit2 size={12} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDeleteClick}
              title="Delete conversation"
            >
              <X size={12} />
            </Button>
          </div>
        )}
      </SidebarMenuItem>

      <EditTitleModal
        conversation={conversation}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <DeleteConversationModal
        conversation={conversation}
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
}
