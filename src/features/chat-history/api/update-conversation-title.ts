import { api } from '@/lib/axios';
import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { Conversation } from '../../graph-chat/types/conversation';
import { listConversationsQueryKey } from './list-conversations';

type UpdateConversationTitleRequest = {
  conversationId: number;
  title: string;
};

const updateConversationTitle = (request: UpdateConversationTitleRequest) =>
  api.patch<{ title: string }, Conversation>(`conversations/${request.conversationId}/title`, {
    title: request.title,
  });

export const useUpdateConversationTitle = (
  options: UseMutationOptions<Conversation, unknown, UpdateConversationTitleRequest, unknown> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateConversationTitle,
    onSuccess: (updatedConversation, variables, context) => {
      // Update the conversations list cache
      queryClient.setQueryData<Conversation[]>(listConversationsQueryKey, (oldConversations) => {
        if (!oldConversations) return oldConversations;
        
        return oldConversations.map((conversation) =>
          conversation.id === updatedConversation.id 
            ? { ...conversation, title: updatedConversation.title }
            : conversation
        );
      });

      options.onSuccess?.(updatedConversation, variables, context);
    },
    ...options,
  });
};

export type { UpdateConversationTitleRequest };
