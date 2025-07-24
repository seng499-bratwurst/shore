'use client';

import { Button } from '@/components/ui/button/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Conversation } from '../../graph-chat/types/conversation';
import { useDeleteConversation } from '../api/delete-conversation';

interface DeleteConversationModalProps {
  conversation: Conversation;
  open: boolean;
  onClose: () => void;
}

export function DeleteConversationModal({ 
  conversation, 
  open, 
  onClose 
}: DeleteConversationModalProps) {
  const deleteConversation = useDeleteConversation();
  const router = useRouter();
  const pathname = usePathname();
  const [error, setError] = useState<string | null>(null);

  const displayTitle = conversation.title || `Chat ${conversation.id}`;

  const handleConfirm = () => {
    setError(null); // Clear any previous errors
    
    deleteConversation.mutate(conversation.id, {
      onSuccess: () => {
        onClose();
        // If user is currently viewing the deleted conversation, redirect to chat home
        if (pathname === `/chat/${conversation.id}`) {
          router.push('/chat');
        }
      },
      onError: (error) => {
        console.error('Failed to delete conversation:', error);
        setError('Failed to delete conversation. Please try again.');
      },
    });
  };

  const handleClose = () => {
    setError(null); // Clear errors when closing
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Conversation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete "{displayTitle}"?
          </p>
          
          <p className="text-sm text-red-600 font-medium">
            Caution! This action cannot be undone.
          </p>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={deleteConversation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={deleteConversation.isPending}
            >
              {deleteConversation.isPending ? 'Deleting...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
