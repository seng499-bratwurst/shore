import type { Edge } from '../types/edge';
import type { Message } from '../types/message';

// Mock messages
export const mockMessages: Message[] = [
  {
    id: 1,
    conversationId: 1,
    promptMessageId: undefined,
    content: 'What is the temperature in the Pacific Ocean?',
    oncApiQuery: 'temperature pacific ocean',
    oncApiResponse: 'The current temperature is 12°C.',
    isHelpful: true,
    role: 'user',
    xCoordinate: 100,
    yCoordinate: 100,
    createdAt: new Date('2025-06-19T10:00:00Z'),
  },
  {
    id: 2,
    conversationId: 1,
    promptMessageId: 1,
    content: 'The current temperature is 12°C.',
    oncApiQuery: undefined,
    oncApiResponse: undefined,
    isHelpful: true,
    role: 'assistant',
    xCoordinate: 300,
    yCoordinate: 100,
    createdAt: new Date('2025-06-19T10:00:01Z'),
  },
  {
    id: 3,
    conversationId: 1,
    promptMessageId: 2,
    content: 'Is that above average?',
    oncApiQuery: 'average temperature pacific ocean',
    oncApiResponse: 'The average is 10°C.',
    isHelpful: false,
    role: 'user',
    xCoordinate: 500,
    yCoordinate: 100,
    createdAt: new Date('2025-06-19T10:00:02Z'),
  },
  {
    id: 4,
    conversationId: 1,
    promptMessageId: 3,
    content: 'The average is 10°C.',
    oncApiQuery: undefined,
    oncApiResponse: undefined,
    isHelpful: true,
    role: 'assistant',
    xCoordinate: 700,
    yCoordinate: 100,
    createdAt: new Date('2025-06-19T10:00:03Z'),
  },
];

// Mock edges
export const mockEdges: Edge[] = [
  {
    id: 1,
    sourceMessageId: 1,
    targetMessageId: 2,
    sourceHandle: 'bottom',
    targetHandle: 'top',
  },
  {
    id: 2,
    sourceMessageId: 2,
    targetMessageId: 3,
    sourceHandle: 'bottom',
    targetHandle: 'top',
  },
  {
    id: 3,
    sourceMessageId: 3,
    targetMessageId: 4,
    sourceHandle: 'bottom',
    targetHandle: 'top',
  },
];
