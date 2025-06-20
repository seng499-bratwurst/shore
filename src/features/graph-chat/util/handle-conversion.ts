import { Position } from '@xyflow/react';
import { HandleSide } from '../types/handle';

export function handleSideToPosition(side: HandleSide): Position {
  switch (side) {
    case 'top':
      return Position.Top;
    case 'right':
      return Position.Right;
    case 'bottom':
      return Position.Bottom;
    case 'left':
      return Position.Left;
    default:
      throw new Error(`Unknown HandleSide: ${side}`);
  }
}
