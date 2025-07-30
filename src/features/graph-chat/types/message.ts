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
  documents?: Array<{
    id: number;
    name: string;
    createdAt: string;
    uploadedBy: string;
    sourceLink: string;
    sourceType: string;
  }>;
};

export type { Message };
