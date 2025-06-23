import { api } from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { Conversation } from '../../graph-chat/types/conversation';

const listConversations = () => api.get<void, Conversation[]>('conversations');

export const listConversationsQueryKey = ['conversations'];

export const useListConversations = () => {
  return useQuery({
    queryKey: listConversationsQueryKey,
    queryFn: listConversations,
  });
};
