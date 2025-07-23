type Message = {
  id: number;
  conversationId?: number;
  promptMessageId?: number;
  content?: string;
  oncApiQuery?: string;
  oncApiResponse?: string;
  isHelpful?: boolean;
  role: string;
  xCoordinate: number;
  yCoordinate: number;
  createdAt: Date;
  // Properties for streaming responses
  isStreaming?: boolean;
  isComplete?: boolean;
};

export type { Message };
