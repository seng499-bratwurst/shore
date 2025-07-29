import { Node, XYPosition } from '@xyflow/react';
import { useGraphChatSettingsStore } from '../stores/graph-chat-settings-store';
import { HandleSide } from '../types/handle';
import { Message } from '../types/message';
enum NEW_PROMPT_LOCATION_STRATEGY {
  CENTER = 'center',
  TOP = 'top',
  RIGHT = 'right',
  LEFT = 'left',
  BOTTOM = 'bottom',
}

// Padding for responses branched from prompts, and prompts branched from responses
const branchedNodePadding = 56;

// Default node dimensions
const nodeWidth = 300;
const nodeHeight = 120;

// Padding for new prompt location to avoid overlap
// This is used when placing a new prompt node based on the current graph state
const newPromptLocationPadding = 40;

// Calculate the coordinates for the node branched from a given node
const branchedNodeCoordinates = (node: Node, side: HandleSide): XYPosition => {
  const width = node.width || node.measured?.width || nodeWidth;
  const height = node.height || node.measured?.height || nodeHeight;

  if (side === 'left') {
    return {
      x: node.position.x - nodeWidth - branchedNodePadding,
      y: node.position.y + Math.ceil(height / 2 - nodeHeight / 2),
    };
  } else if (side === 'right') {
    return {
      x: node.position.x + width + branchedNodePadding,
      y: node.position.y + Math.ceil(height / 2 - nodeHeight / 2),
    };
  } else if (side === 'top') {
    return {
      x: node.position.x,
      y: node.position.y - nodeHeight - branchedNodePadding,
    };
  } else if (side === 'bottom') {
    return {
      x: node.position.x,
      y: node.position.y + height + branchedNodePadding,
    };
  }
  return { x: node.position.x, y: node.position.y };
};

const generateTempNodeId = () => {
  return `${Date.now()}`;
};

// Convert a backend Message object to a Node object for the graph
const messageToNode = (message: Message): Node => ({
  type: message.role === 'assistant' ? 'response' : 'prompt',
  position: { x: message.xCoordinate, y: message.yCoordinate },
  data: {
    content: message.content,
    oncApiQuery: message.oncApiQuery,
    oncApiResponse: message.oncApiResponse,
    documents: message.documents || [],
    isEditable: false,
    isLoading: false,
  },
  id: message.id.toString(),
  draggable: true,
});

// Check if a point (x, y) is overlapping with any existing nodes
const isOverlapping = (nodes: Node[], x: number, y: number) => {
  return nodes.some((node) => {
    const width = node.width || node.measured?.width || nodeWidth;
    const height = node.height || node.measured?.height || nodeHeight;
    return (
      x < node.position.x + width + newPromptLocationPadding &&
      x + nodeWidth + newPromptLocationPadding > node.position.x &&
      y < node.position.y + height + newPromptLocationPadding &&
      y + nodeHeight + newPromptLocationPadding > node.position.y
    );
  });
};

// Get the average position of all nodes to help determine new prompt placement
const getAvgPosition = (nodes: Node[]): XYPosition => {
  if (nodes.length === 0) return { x: 0, y: 0 };
  const avg = nodes.reduce(
    (acc, node) => ({
      x: acc.x + node.position.x,
      y: acc.y + node.position.y,
    }),
    { x: 0, y: 0 }
  );
  return {
    x: avg.x / nodes.length,
    y: avg.y / nodes.length,
  };
};

// Get the node with the extreme position based on the specified side
// This is used to determine where to place new prompts based on existing nodes
const getExtremeNode = (nodes: Node[], side: NEW_PROMPT_LOCATION_STRATEGY): Node | undefined => {
  if (nodes.length === 0) return undefined;
  switch (side) {
    case NEW_PROMPT_LOCATION_STRATEGY.LEFT:
      return nodes.reduce(
        (minNode, node) => (node.position.x < minNode.position.x ? node : minNode),
        nodes[0]
      );
    case NEW_PROMPT_LOCATION_STRATEGY.RIGHT:
      return nodes.reduce(
        (maxNode, node) => (node.position.x > maxNode.position.x ? node : maxNode),
        nodes[0]
      );
    case NEW_PROMPT_LOCATION_STRATEGY.TOP:
      return nodes.reduce(
        (minNode, node) => (node.position.y < minNode.position.y ? node : minNode),
        nodes[0]
      );
    case NEW_PROMPT_LOCATION_STRATEGY.BOTTOM:
      return nodes.reduce(
        (maxNode, node) => (node.position.y > maxNode.position.y ? node : maxNode),
        nodes[0]
      );
    default:
      return undefined;
  }
};

// Find a non-overlapping position for a new node based on existing nodes
// This will spiral out from the given x, y position until a valid position is found
const findNonOverlappingPosition = (nodes: Node[], x: number, y: number): XYPosition => {
  let attempts = 0;
  const maxAttempts = 50;
  let newX = x;
  let newY = y;
  while (isOverlapping(nodes, newX, newY) && attempts < maxAttempts) {
    const angle = (attempts * 45 * Math.PI) / 180;
    const radius = 100 + attempts * 30;
    newX = x + Math.cos(angle) * radius;
    newY = y + Math.sin(angle) * radius;
    attempts++;
  }
  return { x: newX, y: newY };
};

// Generate coordinates for a new prompt node based on the current graph state
// This uses the configured strategy to determine where to place the new prompt
const newPromptCoordinates = (nodes: Node[]): XYPosition => {
  const strategy = useGraphChatSettingsStore.getState().settings.newPromptLocationStrategy;
  if (nodes.length === 0) {
    return { x: 0, y: 0 };
  }

  const avgPosition = getAvgPosition(nodes);

  switch (strategy) {
    case NEW_PROMPT_LOCATION_STRATEGY.CENTER: {
      // Place near center, spiral out if overlapping
      return findNonOverlappingPosition(nodes, avgPosition.x, avgPosition.y);
    }
    case NEW_PROMPT_LOCATION_STRATEGY.LEFT: {
      const leftNode = getExtremeNode(nodes, NEW_PROMPT_LOCATION_STRATEGY.LEFT);
      if (!leftNode) return { x: 0, y: avgPosition.y };
      // Place to the left of the leftmost node, vertically centered
      return findNonOverlappingPosition(
        nodes,
        leftNode.position.x - nodeWidth - newPromptLocationPadding,
        leftNode.position.y + (leftNode.height || nodeHeight) / 2 - nodeHeight / 2
      );
    }
    case NEW_PROMPT_LOCATION_STRATEGY.RIGHT: {
      const rightNode = getExtremeNode(nodes, NEW_PROMPT_LOCATION_STRATEGY.RIGHT);
      if (!rightNode) return { x: avgPosition.x, y: avgPosition.y };
      // Place to the right of the rightmost node, vertically centered
      return findNonOverlappingPosition(
        nodes,
        rightNode.position.x + (rightNode.width || nodeWidth) + newPromptLocationPadding,
        rightNode.position.y + (rightNode.height || nodeHeight) / 2 - nodeHeight / 2
      );
    }
    case NEW_PROMPT_LOCATION_STRATEGY.TOP: {
      const topNode = getExtremeNode(nodes, NEW_PROMPT_LOCATION_STRATEGY.TOP);
      if (!topNode) return { x: avgPosition.x, y: 0 };
      // Place above the topmost node, horizontally centered
      return findNonOverlappingPosition(
        nodes,
        topNode.position.x + (topNode.width || nodeWidth) / 2 - nodeWidth / 2,
        topNode.position.y - nodeHeight - newPromptLocationPadding
      );
    }
    case NEW_PROMPT_LOCATION_STRATEGY.BOTTOM: {
      const bottomNode = getExtremeNode(nodes, NEW_PROMPT_LOCATION_STRATEGY.BOTTOM);
      if (!bottomNode) return { x: avgPosition.x, y: avgPosition.y };
      // Place below the bottommost node, horizontally centered
      return findNonOverlappingPosition(
        nodes,
        bottomNode.position.x + (bottomNode.width || nodeWidth) / 2 - nodeWidth / 2,
        bottomNode.position.y + (bottomNode.height || nodeHeight) + newPromptLocationPadding
      );
    }
    default:
      return findNonOverlappingPosition(nodes, avgPosition.x, avgPosition.y);
  }
};

export {
  branchedNodeCoordinates,
  generateTempNodeId,
  messageToNode,
  NEW_PROMPT_LOCATION_STRATEGY,
  newPromptCoordinates,
};
