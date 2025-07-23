import { api } from '@/lib/axios';
import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { Conversation } from '../../graph-chat/types/conversation';
import { listConversationsQueryKey } from './list-conversations';

const deleteConversation = (conversationId: number) =>
  api.delete(`conversations/${conversationId}`);

export const useDeleteConversation = (
  options: UseMutationOptions<unknown, unknown, number, unknown> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: (_, conversationId, context) => {
      // Remove the deleted conversation from the conversations list cache
      queryClient.setQueryData(listConversationsQueryKey, (oldConversations: Conversation[]) => {
        if (!oldConversations) return oldConversations;
        
        return oldConversations.filter((conversation) => conversation.id !== conversationId);
      });

      options.onSuccess?.(_, conversationId, context);
    },
    ...options,
  });
};
