'use client';

import { Button } from '@/components/ui/button/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { useRouter } from 'next/navigation';
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

  const displayTitle = conversation.title || `Chat ${conversation.id}`;

  const handleConfirm = () => {
    deleteConversation.mutate(conversation.id, {
      onSuccess: () => {
        onClose();
        // If user is currently viewing the deleted conversation, redirect to chat home
        if (window.location.pathname === `/chat/${conversation.id}`) {
          router.push('/chat');
        }
      },
      onError: (error) => {
        console.error('Failed to delete conversation:', error);
        // You could add toast notification here
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
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

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
