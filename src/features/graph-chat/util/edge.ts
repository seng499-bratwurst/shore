import { EdgeMarkerType, MarkerType } from '@xyflow/react';
import { Edge, ReactFlowEdge } from '../types/edge';

export const targetArrow: EdgeMarkerType = {
  type: MarkerType.Arrow,
  width: 32,
  height: 32,
};

const createEdgeId = (source: string | number, target: string | number): string => {
  return `e${source}-${target}`;
};

const messageEdgeToReactFlowEdge = (edge: Edge): ReactFlowEdge => ({
  id: createEdgeId(edge.sourceMessageId, edge.targetMessageId),
  source: edge.sourceMessageId.toString(),
  target: edge.targetMessageId.toString(),
  sourceHandle: edge.sourceHandle,
  targetHandle: edge.targetHandle,
  markerEnd: targetArrow,
});

export { createEdgeId, messageEdgeToReactFlowEdge };
