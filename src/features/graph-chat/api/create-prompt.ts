import { listConversationsQueryKey } from '@/features/chat-history/api/list-conversations';
import { api } from '@/lib/axios';
import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edge } from '../types/edge';
import { HandleId } from '../types/handle';
import { Message } from '../types/message';
import { createConversationEdgesQueryKey } from './get-conversation-edges';
import { createConversationMessagesQueryKey } from './get-conversation-messages';

type CreatePromptRequest = {
  conversationId?: number;
  content: string;
  xCoordinate: number;
  yCoordinate: number;
  responseXCoordinate: number;
  responseYCoordinate: number;
  sourceHandle: HandleId;
  targetHandle: HandleId;
  sources: {
    sourceMessageId: number;
    sourceHandle: HandleId;
    targetHandle: HandleId;
  }[];
};

type CreatePromptResponse = {
  conversationId: number;
  responseMessageId: number;
  createdEdges: Edge[];
  promptMessageId: number;
  response: string;
  isStreaming?: boolean;
  isComplete?: boolean;
};

const createPrompt = (prompt: CreatePromptRequest) => {
  if (!prompt.conversationId) delete prompt.conversationId;
  return api.post<CreatePromptRequest, CreatePromptResponse>('messages', prompt);
};

export const useCreatePrompt = (
  conversationId: number | undefined,
  options: Omit<
    UseMutationOptions<CreatePromptResponse, unknown, CreatePromptRequest, unknown>,
    'mutationFn'
  > = {}
): UseMutationResult<CreatePromptResponse, unknown, CreatePromptRequest, unknown> => {
  const queryClient = useQueryClient();

  return useMutation<CreatePromptResponse, unknown, CreatePromptRequest, unknown>({
    mutationFn: createPrompt,
    retry: false,
    onMutate: () => {
      console.log('Starting prompt creation mutation...');
    },
    onSuccess: (response) => {
      console.log('Prompt creation mutation successful:', response.conversationId);
      
      if (response.conversationId) {
        queryClient.invalidateQueries({ 
          queryKey: createConversationMessagesQueryKey(response.conversationId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: createConversationEdgesQueryKey(response.conversationId) 
        });
      }
    },
    // onSuccess: (response) => {
    //   console.log('Prompt creation successful:', response);
    //   console.log('Response details:', {
    //     conversationId: response.conversationId,
    //     promptMessageId: response.promptMessageId,
    //     responseMessageId: response.responseMessageId,
    //     isStreaming: response.isStreaming,
    //     isComplete: response.isComplete,
    //   });
    //   // Set conversation ID if it was created
    //   if (response.conversationId && !conversationId) {
    //     console.log('New conversation created:', response.conversationId);
    //     queryClient.invalidateQueries({ queryKey: listConversationsQueryKey });
    //   }
    //   // Trigger immediate refetch to pick up the streaming data
    //   console.log('Invalidating queries for conversation:', response.conversationId);
    //   queryClient.invalidateQueries({ 
    //     queryKey: createConversationMessagesQueryKey(response.conversationId) 
    //   });
    //   queryClient.invalidateQueries({ 
    //     queryKey: createConversationEdgesQueryKey(response.conversationId) 
    //   });
    // },
    onError: (error) => {
      console.error('Error creating prompt:', error);
    },
    ...options,
  });
};

// export const useCreatePrompt = (
//   conversationId: number | undefined,
//   options: Omit<
//     UseMutationOptions<CreatePromptResponse, unknown, CreatePromptRequest, unknown>,
//     'mutationFn'
//   > = {}
// ): UseMutationResult<CreatePromptResponse, unknown, CreatePromptRequest, unknown> => {
//   const queryClient = useQueryClient();

//   const updateCache = (
//     response: CreatePromptResponse,
//     request: CreatePromptRequest,
//     _: unknown
//   ) => {
//     queryClient.setQueryData<Message[]>(
//       createConversationMessagesQueryKey(conversationId),
//       (messages) => {
//         const prompt: Message = {
//           conversationId: response.conversationId,
//           id: response.promptMessageId,
//           content: request.content,
//           xCoordinate: request.xCoordinate,
//           yCoordinate: request.yCoordinate,
//           oncApiQuery: '',
//           oncApiResponse: '',
//           isHelpful: false,
//           role: 'user',
//           createdAt: new Date(),
//         };
//         return [
//           ...(messages || []),
//           prompt,
//           {
//             conversationId: response.conversationId,
//             id: response.responseMessageId,
//             content: response.response || '', // handle empty initial response
//             xCoordinate: request.responseXCoordinate,
//             yCoordinate: request.responseYCoordinate,
//             oncApiQuery: '',
//             oncApiResponse: '',
//             isHelpful: false,
//             role: 'assistant',
//             createdAt: new Date(),
//             isStreaming: true, // start as streaming
//             isComplete: false, // not complete yet
//           },
//         ];
//       }
//     );

//     if (response.createdEdges && response.createdEdges.length > 0) {
//       queryClient.setQueryData<Edge[]>(createConversationEdgesQueryKey(conversationId), (edges) => {
//         return [...(edges || []), ...(response.createdEdges || [])];
//       });
//     }

    
//     if (!conversationId) queryClient.invalidateQueries({ queryKey: listConversationsQueryKey });
//   };

//   return useMutation<CreatePromptResponse, unknown, CreatePromptRequest, unknown>({
//     mutationFn: createPrompt,
//     onSuccess: updateCache,
//     ...options,
//   });
// };
