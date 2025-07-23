'use client';

import { Button } from '@/components/ui/button/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { Input } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label/label';
import { useState } from 'react';
import { Conversation } from '../../graph-chat/types/conversation';
import { useUpdateConversationTitle } from '../api/update-conversation-title';

interface EditTitleModalProps {
  conversation: Conversation;
  open: boolean;
  onClose: () => void;
}

export function EditTitleModal({ conversation, open, onClose }: EditTitleModalProps) {
  const [newTitle, setNewTitle] = useState(conversation.title || '');
  const updateConversationTitle = useUpdateConversationTitle();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTitle.trim()) {
      return; // Don't submit empty titles
    }

    updateConversationTitle.mutate(
      {
        conversationId: conversation.id,
        title: newTitle.trim(),
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (error) => {
          console.error('Failed to update conversation title:', error);
          // You could add toast notification here
        },
      }
    );
  };

  const handleCancel = () => {
    setNewTitle(conversation.title || ''); // Reset to original title
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Conversation Title</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="previous-title">Previous Conversation Title:</Label>
            <Input
              id="previous-title"
              value={conversation.title || `Chat ${conversation.id}`}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-title">New Conversation Title:</Label>
            <Input
              id="new-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter new conversation title"
              disabled={updateConversationTitle.isPending}
              maxLength={100} // Add reasonable length limit
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateConversationTitle.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateConversationTitle.isPending || !newTitle.trim()}
            >
              {updateConversationTitle.isPending ? 'Updating...' : 'Confirm'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
