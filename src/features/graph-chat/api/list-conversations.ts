import { api } from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { Conversation } from '../types/conversation';

const listConversations = () => api.get<void, Conversation[]>('conversations');

export const useListConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: listConversations,
  });
};
