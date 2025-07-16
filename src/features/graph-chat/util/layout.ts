import type { Node } from '@xyflow/react';
import dagre from 'dagre';
import { useGraphChatSettingsStore } from '../stores/graph-chat-settings-store';
import { ReactFlowEdge } from '../types/edge';

// Dagre graph will be instantiated per layout calculation

export type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL';

interface LayoutOptions {
  nodeWidth?: number;
  nodeHeight?: number;
}

// Apply Dagre layout to nodes and edges
export const getLayoutedElements = (
  nodes: Node[],
  edges: ReactFlowEdge[],
  options: LayoutOptions = {}
): { nodes: Node[]; edges: ReactFlowEdge[] } => {
  const { nodeWidth = 250, nodeHeight = 100 } = options;

  // Get layout settings from the store
  const layoutSettings = useGraphChatSettingsStore.getState().settings.layout;

  // Create a new dagre graph for each layout calculation
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: layoutSettings.direction,
    ranksep: layoutSettings.ranksep,
    nodesep: layoutSettings.nodesep,
    edgesep: layoutSettings.edgesep,
    marginx: layoutSettings.marginx,
    marginy: layoutSettings.marginy,
    ranker: layoutSettings.ranker,
    align: layoutSettings.align,
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    const width = node.width || node.measured?.width || nodeWidth;
    const height = node.height || node.measured?.height || nodeHeight;
    dagreGraph.setNode(node.id, {
      width,
      height,
    });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply new positions to nodes
  const layoutedNodes: Node[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // Dagre gives us the center position, but React Flow expects top-left
    const width = node.width || node.measured?.width || nodeWidth;
    const height = node.height || node.measured?.height || nodeHeight;
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  // For edges, we keep them as-is since React Flow will handle the routing
  // based on the handle positions
  const layoutedEdges: ReactFlowEdge[] = edges.map((edge) => ({
    ...edge,
  }));

  return {
    nodes: layoutedNodes,
    edges: layoutedEdges,
  };
};

// Utility to trigger layout on existing graph
export const applyAutoLayout = (
  nodes: Node[],
  edges: ReactFlowEdge[],
  options?: LayoutOptions
): { nodes: Node[]; edges: ReactFlowEdge[] } => {
  return getLayoutedElements(nodes, edges, options);
};
