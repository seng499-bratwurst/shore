import { Edge as _Edge } from '@xyflow/react'; // Assuming _Edge is imported from a library like xyflow
import { HandleId } from './handle';

type Edge = {
  id: number;
  sourceMessageId: number;
  targetMessageId: number;
  sourceHandle: HandleId; // Default to "bottom" if not provided
  targetHandle: HandleId; // Default to "top" if not provided
};

type ReactFlowEdge = Omit<_Edge, 'sourceHandle' | 'targetHandle'> & {
  sourceHandle: HandleId;
  targetHandle: HandleId;
};

export type { Edge, ReactFlowEdge };
