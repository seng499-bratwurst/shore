import { EdgeMarkerType, MarkerType } from '@xyflow/react';
import { useGraphChatSettingsStore } from '../stores/graph-chat-settings-store';
import { Edge, ReactFlowEdge } from '../types/edge';
import { HandleId } from '../types/handle';

export const targetArrow: EdgeMarkerType = {
  type: MarkerType.Arrow,
  width: 32,
  height: 32,
};

const createEdgeId = (source: string | number, target: string | number): string => {
  return `e${source}-${target}`;
};

const createTemporaryEdge = (
  source: string,
  target: string,
  sourceHandle: HandleId,
  targetHandle: HandleId
): ReactFlowEdge => {
  const edgeType = useGraphChatSettingsStore.getState().settings.edgeType;

  return {
    id: createEdgeId(source, target),
    source,
    target,
    sourceHandle,
    targetHandle,
    markerEnd: targetArrow,
    type: edgeType === 'default' ? undefined : edgeType,
  };
};

const messageEdgeToReactFlowEdge = (edge: Edge): ReactFlowEdge => {
  const edgeType = useGraphChatSettingsStore.getState().settings.edgeType;

  // Handle both capitalized (backend) and lowercase (frontend) field names
  const sourceMessageId = edge.sourceMessageId || edge.SourceMessageId;
  const targetMessageId = edge.targetMessageId || edge.TargetMessageId;

  // Add null checks to prevent toString() errors
  if (!sourceMessageId || !targetMessageId) {
    throw new Error(`Invalid edge data: sourceMessageId=${sourceMessageId}, targetMessageId=${targetMessageId}`);
  }

  return {
    id: createEdgeId(sourceMessageId, targetMessageId),
    source: sourceMessageId.toString(),
    target: targetMessageId.toString(),
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    markerEnd: targetArrow,
    type: edgeType === 'default' ? undefined : edgeType,
  };
};

export { createEdgeId, createTemporaryEdge, messageEdgeToReactFlowEdge };
