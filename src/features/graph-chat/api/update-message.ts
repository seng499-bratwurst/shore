import { api } from '@/lib/axios';
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import { Message } from '../types/message';
import { createConversationMessagesQueryKey } from './get-conversation-messages';

type UpdateMessage = {
  id: number;
  xCoordinate: number;
  yCoordinate: number;
};

const updateMessage = (update: UpdateMessage) =>
  api.patch<UpdateMessage, UpdateMessage>(`messages/${update.id}`, update);

const useUpdateMessage = (
  conversationId: number,
  options: UseMutationOptions<UpdateMessage, unknown, UpdateMessage, unknown> = {}
): UseMutationResult<UpdateMessage, unknown, UpdateMessage, unknown> => {
  const queryClient = useQueryClient();

  const updateMessageCoordinatesInCache = (updated: UpdateMessage) => {
    queryClient.setQueryData<Message[]>(
      createConversationMessagesQueryKey(conversationId),
      (messages) => {
        if (!messages) return messages;

        return messages.map((msg) =>
          msg.id === updated.id
            ? { ...msg, xCoordinate: updated.xCoordinate, yCoordinate: updated.yCoordinate }
            : msg
        );
      }
    );
  };
  return useMutation<UpdateMessage, unknown, UpdateMessage, unknown>({
    mutationFn: (update: UpdateMessage) => updateMessage(update),
    onSuccess: (data, variables, context) => {
      updateMessageCoordinatesInCache(variables);
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export { useUpdateMessage };
