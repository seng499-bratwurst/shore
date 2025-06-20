import { api } from '@/lib/axios';
import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { Edge } from '../types/edge';

const getConversationEdges = (conversationId: number) =>
  api.get<string, Edge[]>(`conversations/${conversationId}/edges`);

export const useGetConversationEdges = (
  conversationId: number,
  options: Omit<UseQueryOptions<Edge[], unknown>, 'queryKey' | 'queryFn'> = {}
): UseQueryResult<Edge[], unknown> => {
  return useQuery({
    queryKey: ['conversation-edges', conversationId],
    queryFn: () => getConversationEdges(conversationId),
    ...options,
  });
};
