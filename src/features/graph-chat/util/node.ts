import { Node, XYPosition } from '@xyflow/react';
import { HandleSide } from '../types/handle';
import { Message } from '../types/message';

const branchedNodeCoordinates = (response: Node, side: HandleSide): XYPosition => {
  console.log(`dimensions of response node: ${response.width}x${response.height}`);

  if (side === 'left') {
    return {
      x: response.position.x - 400,
      y: response.position.y - 75,
    };
  } else if (side === 'right') {
    return {
      x: response.position.x + (response.width || 0) + 400,
      y: response.position.y - 75,
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

export { branchedNodeCoordinates, determinePromptBranchSide, generateTempNodeId, messageToNode };
