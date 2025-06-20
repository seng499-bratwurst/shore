import { api } from '@/lib/axios';
import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edge } from '../types/edge';
import { HandleSide } from '../types/handle';
import { Message } from '../types/message';

type CreatePromptRequest = {
  conversationId?: number;
  content: string;
  xCoordinate: number;
  yCoordinate: number;
  responseXCoordinate: number;
  responseYCoordinate: number;
  promptHandle: HandleSide;
  responseHandle: HandleSide;
  sources: {
    sourceMessageId: number;
    sourceHandle: HandleSide;
    targetHandle: HandleSide;
  }[];
};

type CreatePromptResponse = {
  conversationId: number;
  responseMessageId: number;
  createdEdges: Edge[];
  promptMessageId: number;
  response: string;
};

const createPrompt = (prompt: CreatePromptRequest) => {
  if (!prompt.conversationId) delete prompt.conversationId;
  return api.post<CreatePromptRequest, CreatePromptResponse>('messages', prompt);
};

export const useCreatePrompt = (
  conversationId: number | null,
  options: Omit<
    UseMutationOptions<CreatePromptResponse, unknown, CreatePromptRequest, unknown>,
    'mutationFn'
  > = {}
): UseMutationResult<CreatePromptResponse, unknown, CreatePromptRequest, unknown> => {
  const queryClient = useQueryClient();

  const updateCache = (
    response: CreatePromptResponse,
    request: CreatePromptRequest,
    _: unknown
  ) => {
    queryClient.setQueryData<Message[]>(['conversation-messages', conversationId], (messages) => {
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
    });

    queryClient.setQueryData<Edge[]>(['conversation-edges', conversationId], (edges) => {
      return [...(edges || []), ...response.createdEdges];
    });
  };

  return useMutation<CreatePromptResponse, unknown, CreatePromptRequest, unknown>({
    mutationFn: createPrompt,
    onSuccess: updateCache,
    ...options,
  });
};
