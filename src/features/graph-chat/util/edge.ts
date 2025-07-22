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

  return {
    id: createEdgeId(edge.sourceMessageId, edge.targetMessageId),
    source: edge.sourceMessageId.toString(),
    target: edge.targetMessageId.toString(),
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    markerEnd: targetArrow,
    type: edgeType === 'default' ? undefined : edgeType,
  };
};

export { createEdgeId, createTemporaryEdge, messageEdgeToReactFlowEdge };
