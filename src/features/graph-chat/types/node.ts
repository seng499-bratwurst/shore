import { HandleSide } from './handle';

type PromptCreation = {
  conversationId: number;
  content: string;
  xCoordinate: number;
  yCoordinate: number;
  responseXCoordinate: number;
  responseYCoordinate: number;
  sources: {
    sourceMessageId: number;
    sourceHandle: HandleSide;
    targetHandle: HandleSide;
  }[];
};

export type { PromptCreation };
