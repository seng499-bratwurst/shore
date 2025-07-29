import { api } from '@/lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Message } from '../types/message';
import { createConversationMessagesQueryKey } from './get-conversation-messages';

type FeedbackPayload = {
  messageId: number;
  isHelpful: boolean;
};

const sendFeedback = (payload: FeedbackPayload) =>
  api.patch(`messages/${payload.messageId}/feedback`, {
    isHelpful: payload.isHelpful,
  });

const useUpdateFeedback = (conversationId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendFeedback,
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Message[]>(
        createConversationMessagesQueryKey(conversationId),
        (messages) =>
          messages?.map((msg) =>
            msg.id === variables.messageId ? { ...msg, isHelpful: variables.isHelpful } : msg
          )
      );
    },
  });
};

export { useUpdateFeedback };
