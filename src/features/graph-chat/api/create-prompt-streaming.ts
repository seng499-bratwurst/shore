import { useAuthStore } from '@/features/auth/stores/auth-store';
import { listConversationsQueryKey } from '@/features/chat-history/api/list-conversations';
import { api } from '@/lib/axios';
import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edge } from '../types/edge';
import { HandleId } from '../types/handle';
import { Message } from '../types/message';
import { createConversationEdgesQueryKey } from './get-conversation-edges';
import { createConversationMessagesQueryKey } from './get-conversation-messages';

// Types for streaming
type CreatePromptStreamRequest = {
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

type StreamChunk = {
  type: 'chunk';
  data: string;
  promptMessageId: number;
};

type StreamComplete = {
  type: 'complete';
  data: {
    conversationId: number;
    documents: unknown[];
    response: string;
    promptMessageId: number;
    responseMessageId: number;
    createdEdges: Edge[];
  };
};

type StreamError = {
  type: 'error';
  data: string;
};

type StreamEvent = StreamChunk | StreamComplete | StreamError;

type CreatePromptStreamResponse = {
  conversationId: number;
  responseMessageId: number;
  createdEdges: Edge[];
  promptMessageId: number;
  response: string;
  documents: Array<{
    id: number;
    name: string;
    createdAt: string;
    uploadedBy: string;
    sourceLink: string;
    sourceType: string;
  }>;
};

// Streaming callbacks
type StreamingCallbacks = {
  onChunk?: (chunk: string, promptMessageId: number) => void;
  onComplete?: (response: CreatePromptStreamResponse) => void;
  onError?: (error: string) => void;
};

const createPromptStreaming = async (
  prompt: CreatePromptStreamRequest,
  callbacks: StreamingCallbacks
): Promise<CreatePromptStreamResponse> => {
  if (!prompt.conversationId) delete prompt.conversationId;
  
  const isLoggedIn = useAuthStore.getState().isLoggedIn;
  let url: string;
  let body: CreatePromptStreamRequest & { sessionId?: string };
  
  if (!isLoggedIn) {
    const sessionalKey = useAuthStore.getState().sessionalKey;
    if (!sessionalKey) {
      throw new Error('Sessional key is required for guest users');
    }
    url = `${api.defaults.baseURL}messages/guest/stream`;
    body = {
      ...prompt,
      sessionId: sessionalKey,
    };
  } else {
    url = `${api.defaults.baseURL}messages/stream`;
    body = prompt;
  }

  // Use same auth pattern as the axios instance (cookies with credentials)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
    'Cache-Control': 'no-cache',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    credentials: 'include', // Enable cookies like the axios instance
  });

  if (!response.ok) {
    // Provide more detailed error information
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}, url: ${url}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalResponse: CreatePromptStreamResponse | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('data: ')) {
          const data = line.slice(6); // Remove 'data: ' prefix
          
          if (data === '[DONE]') {
            // End of stream
            break;
          }

          try {
            const event: StreamEvent = JSON.parse(data);
            
            switch (event.type) {
              case 'chunk':
                callbacks.onChunk?.(event.data, event.promptMessageId);
                break;
              case 'complete':
                finalResponse = {
                  conversationId: event.data.conversationId,
                  responseMessageId: event.data.responseMessageId,
                  createdEdges: event.data.createdEdges,
                  promptMessageId: event.data.promptMessageId,
                  response: event.data.response,
                  documents: (event.data.documents || []) as Array<{
                    id: number;
                    name: string;
                    createdAt: string;
                    uploadedBy: string;
                    sourceLink: string;
                    sourceType: string;
                  }>,
                };
                if (finalResponse) {
                  callbacks.onComplete?.(finalResponse);
                }
                break;
              case 'error':
                callbacks.onError?.(event.data);
                throw new Error(event.data);
            }
          } catch (parseError) {
            console.error('Error parsing SSE data:', parseError, 'Raw data:', data);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!finalResponse) {
    throw new Error('No complete response received from stream');
  }

  return finalResponse;
};

export const useCreatePromptStreaming = (
  conversationId: number | undefined,
  options: Omit<
    UseMutationOptions<CreatePromptStreamResponse, unknown, CreatePromptStreamRequest & { callbacks?: StreamingCallbacks }, unknown>,
    'mutationFn'
  > = {}
): UseMutationResult<CreatePromptStreamResponse, unknown, CreatePromptStreamRequest & { callbacks?: StreamingCallbacks }, unknown> => {
  const queryClient = useQueryClient();

  const updateCache = (response: CreatePromptStreamResponse, request: CreatePromptStreamRequest) => {
    queryClient.setQueryData<Message[]>(
      createConversationMessagesQueryKey(conversationId),
      (messages) => {
        const prompt: Message = {
          conversationId: response.conversationId,
          id: response.promptMessageId,
          content: request.content,
          xCoordinate: request.xCoordinate,
          yCoordinate: request.yCoordinate,
          oncApiQuery: '',
          oncApiResponse: '',
          isHelpful: false,
          role: 'user',
          createdAt: new Date(),
        };
        return [
          ...(messages || []),
          prompt,
          {
            conversationId: response.conversationId,
            id: response.responseMessageId,
            content: response.response,
            xCoordinate: request.responseXCoordinate,
            yCoordinate: request.responseYCoordinate,
            oncApiQuery: '',
            oncApiResponse: '',
            isHelpful: false,
            role: 'assistant',
            createdAt: new Date(),
          },
        ];
      }
    );

    queryClient.setQueryData<Edge[]>(createConversationEdgesQueryKey(conversationId), (edges) => {
      return [...(edges || []), ...response.createdEdges];
    });
    if (!conversationId) queryClient.invalidateQueries({ queryKey: listConversationsQueryKey });
  };

  return useMutation<CreatePromptStreamResponse, unknown, CreatePromptStreamRequest & { callbacks?: StreamingCallbacks }, unknown>({
    mutationFn: ({ callbacks, ...prompt }: CreatePromptStreamRequest & { callbacks?: StreamingCallbacks }) => 
      createPromptStreaming(prompt, callbacks || {}),
    onSuccess: (response, request) => {
      updateCache(response, request);
      options.onSuccess?.(response, request, undefined);
    },
    ...options,
  });
};

export type { 
  CreatePromptStreamRequest, 
  CreatePromptStreamResponse, 
  StreamingCallbacks,
  StreamEvent,
  StreamChunk,
  StreamComplete,
  StreamError
};
