type Conversation = {
  id: number;
  userId?: string;
  sessionId?: string;
  title?: string;
  firstInteraction: Date;
  lastInteraction: Date;
};

export type { Conversation };
