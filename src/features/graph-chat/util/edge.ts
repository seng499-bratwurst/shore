import { Edge, ReactFlowEdge } from '../types/edge';

const createEdgeId = (source: string | number, target: string | number): string => {
  return `e${source}-${target}`;
};

const messageEdgeToReactFlowEdge = (edge: Edge): ReactFlowEdge => ({
  id: createEdgeId(edge.sourceMessageId, edge.targetMessageId),
  source: edge.sourceMessageId.toString(),
  target: edge.targetMessageId.toString(),
  sourceHandle: edge.sourceHandle,
  targetHandle: edge.targetHandle,
});

export { createEdgeId, messageEdgeToReactFlowEdge };
