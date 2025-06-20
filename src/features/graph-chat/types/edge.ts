import { HandleId } from './handle';

type Edge = {
  id: number;
  sourceMessageId: number;
  targetMessageId: number;
  sourceHandle: HandleId; // Default to "bottom" if not provided
  targetHandle: HandleId; // Default to "top" if not provided
};

export type { Edge };
