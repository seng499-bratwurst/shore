import { api } from '@/lib/axios';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Message } from '../types/message';

const getConversationMessages = (conversationId: number) => {
  console.log('Fetching messages for conversation:', conversationId);
  return api.get<number, Message[]>(`conversations/${conversationId}/messages`);
};
  

export const createConversationMessagesQueryKey = (conversationId: number | undefined) => [
  'conversation-messages',
  conversationId,
];

export const useGetConversationMessages = (
  conversationId: number,
  options: Omit<UseQueryOptions<Message[], unknown>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: createConversationMessagesQueryKey(conversationId),
    queryFn: () => {
      console.log('QUERY FUNCTION CALLED for conversation:', conversationId);
      return getConversationMessages(conversationId);
    },

    enabled: !!conversationId && conversationId > 0, // Only run if we have a valid conversation ID

    refetchInterval: (query) => {
      console.log('Debug: query state:', {
        hasData: !!query.state.data,
        dataType: typeof query.state.data,
        isArray: Array.isArray(query.state.data),
        data: query.state.data,
        status: query.state.status,
        error: query.state.error
      });

      if (!query.state.data || !Array.isArray(query.state.data)) {
        console.log('No data or not an array, skipping refetch interval');
        return false;
      }

      const hasIncompleteMessages = query.state.data.some((message: Message) => 
        message.isStreaming && !message.isComplete
      );
      
      const streamingMessages = query.state.data.filter((message: Message) => 
        message.isStreaming && !message.isComplete
      );

      console.log('Polling check:', { 
        hasIncompleteMessages, 
        messageCount: query.state.data.length,
        streamingMessages: streamingMessages.map((m: Message) => ({ 
          id: m.id, 
          content: m.content?.substring(0, 50) + '...' 
        }))
      });

      return hasIncompleteMessages ? 500 : false; // Poll every 500ms if streaming
    },
    // onSuccess: (data: Message[]) => {
    //   console.log('Messages fetched:', data?.length, 'messages');
    //   console.log('Messages:', data?.map((m: Message) => ({ 
    //     id: m.id, 
    //     role: m.role, 
    //     isStreaming: m.isStreaming, 
    //     isComplete: m.isComplete,
    //     content: m.content?.substring(0, 50) + '...' 
    //   })));
    // },
    // onError: (error: unknown) => {
    //   console.error('Error fetching messages:', error);
    // },
    ...options,
  });
  // return useQuery({
  //   queryKey: createConversationMessagesQueryKey(conversationId),
  //   queryFn: () => getConversationMessages(conversationId),
  //   // Enable automatic refetching when there are incomplete messages
  //   refetchInterval: (query) => {
  //     if (!query.state.data || !Array.isArray(query.state.data)) return false;
  //     const hasIncompleteMessages = query.state.data.some((message: Message) => 
  //       message.isStreaming && !message.isComplete
  //     );
  //     return hasIncompleteMessages ? 500 : false; // Poll every 500ms if streaming
  //   },
  //   ...options,
  // });
};
