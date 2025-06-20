import { HandleSide } from './handle';

type Edge = {
  id: number;
  sourceMessageId: number;
  targetMessageId: number;
  sourceHandle?: HandleSide; // Default to "bottom" if not provided
  targetHandle?: HandleSide; // Default to "top" if not provided
};

export type { Edge };
