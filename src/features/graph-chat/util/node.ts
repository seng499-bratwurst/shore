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

const branchedNodeCoordinates = (response: Node, side: HandleSide): XYPosition => {
  console.log(`dimensions of response node: ${response.width}x${response.height}`);

  if (side === 'left') {
    return {
      x: response.position.x - 400,
      y: response.position.y + 75,
    };
  } else if (side === 'right') {
    return {
      x: response.position.x + (response.width || 0) + 400,
      y: response.position.y + 75,
    };
  } else if (side === 'top') {
    return {
      x: response.position.x,
      y: response.position.y - 350,
    };
  } else if (side === 'bottom') {
    let extra = 0;
    console.log(`response content length: ${(response.data.content as string)?.length}`);
    extra = (response.data.content as string)?.length / 1.1 || 0;
    return {
      x: response.position.x,
      y: response.position.y + extra + 250,
    };
  }
  return { x: response.position.x, y: response.position.y };
};

const generateTempNodeId = () => {
  return `${Date.now()}`;
};

// Should determine the best way to place a response node based on where the prompt is.
// This is basically a placeholder until something better is implemented
const determinePromptBranchSide = (position: XYPosition): HandleSide => {
  if (position.x < 0) {
    return 'left';
  } else if (position.x > window.innerWidth / 2) {
    return 'right';
  } else if (position.y < window.innerHeight / 2) {
    return 'top';
  } else {
    return 'bottom';
  }
};

const messageToNode = (message: Message): Node => ({
  type: message.role === 'assistant' ? 'response' : 'prompt',
  position: { x: message.xCoordinate, y: message.yCoordinate },
  data: {
    content: message.content,
    oncApiQuery: message.oncApiQuery,
    oncApiResponse: message.oncApiResponse,
    isEditable: false,
    isLoading: false,
  },
  id: message.id.toString(),
  draggable: true,
});

const nodeWidth = 300;
const nodeHeight = 120;
const padding = 40;

const isOverlapping = (nodes: Node[], x: number, y: number) => {
  return nodes.some((node) => {
    const width = node.width || node.measured?.width || nodeWidth;
    const height = node.height || node.measured?.height || nodeHeight;
    return (
      x < node.position.x + width + padding &&
      x + nodeWidth + padding > node.position.x &&
      y < node.position.y + height + padding &&
      y + nodeHeight + padding > node.position.y
    );
  });
};

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
        leftNode.position.x - nodeWidth - padding,
        leftNode.position.y + (leftNode.height || nodeHeight) / 2 - nodeHeight / 2
      );
    }
    case NEW_PROMPT_LOCATION_STRATEGY.RIGHT: {
      const rightNode = getExtremeNode(nodes, NEW_PROMPT_LOCATION_STRATEGY.RIGHT);
      if (!rightNode) return { x: avgPosition.x, y: avgPosition.y };
      // Place to the right of the rightmost node, vertically centered
      return findNonOverlappingPosition(
        nodes,
        rightNode.position.x + (rightNode.width || nodeWidth) + padding,
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
        topNode.position.y - nodeHeight - padding
      );
    }
    case NEW_PROMPT_LOCATION_STRATEGY.BOTTOM: {
      const bottomNode = getExtremeNode(nodes, NEW_PROMPT_LOCATION_STRATEGY.BOTTOM);
      if (!bottomNode) return { x: avgPosition.x, y: avgPosition.y };
      // Place below the bottommost node, horizontally centered
      return findNonOverlappingPosition(
        nodes,
        bottomNode.position.x + (bottomNode.width || nodeWidth) / 2 - nodeWidth / 2,
        bottomNode.position.y + (bottomNode.height || nodeHeight) + padding
      );
    }
    default:
      return findNonOverlappingPosition(nodes, avgPosition.x, avgPosition.y);
  }
};

export {
  branchedNodeCoordinates,
  determinePromptBranchSide,
  generateTempNodeId,
  messageToNode,
  NEW_PROMPT_LOCATION_STRATEGY,
  newPromptCoordinates,
};
