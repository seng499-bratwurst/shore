import { api } from '@/lib/axios';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Message } from '../types/message';

const getConversationMessages = (conversationId: number) =>
  api.get<number, Message[]>(`conversations/${conversationId}/messages`);

export const useGetConversationMessages = (
  conversationId: number,
  options: Omit<UseQueryOptions<Message[], unknown>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: () => getConversationMessages(conversationId),
    ...options,
  });
};
