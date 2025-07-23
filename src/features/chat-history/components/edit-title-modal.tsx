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
  const [error, setError] = useState<string | null>(null);
  const updateConversationTitle = useUpdateConversationTitle();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    setError(null);
    
    if (!newTitle.trim()) {
      setError('Title cannot be empty');
      return;
    }

    updateConversationTitle.mutate(
      {
        conversationId: conversation.id,
        title: newTitle.trim(),
      },
      {
        onSuccess: () => {
          setError(null);
          onClose();
        },
        onError: (error) => {
          console.error('Failed to update conversation title:', error);
          setError('Failed to update conversation title. Please try again.');
        },
      }
    );
  };

  const handleCancel = () => {
    setNewTitle(conversation.title || ''); // Reset to original title
    setError(null); // Clear any errors
    onClose();
  };

  // Reset error when user starts typing
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
    if (error) {
      setError(null);
    }
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
              onChange={handleTitleChange}
              placeholder="Enter new conversation title"
              disabled={updateConversationTitle.isPending}
              maxLength={100} // Add reasonable length limit
              className={error ? 'border-red-500 focus:border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {error}
              </p>
            )}
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
