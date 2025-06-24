import { HandleId, HandleSide } from '../types/handle';

const createHandleId = (prefix: 's' | 't', side: HandleSide): HandleId => {
  return `${prefix}-${side}`;
};

const createSourceHandleId = (side: HandleSide): HandleId => {
  return createHandleId('s', side);
};

const createTargetHandleId = (side: HandleSide): HandleId => {
  return createHandleId('t', side);
};

const oppositeHandleSide = (side: HandleSide): HandleSide => {
  switch (side) {
    case 'top':
      return 'bottom';
    case 'bottom':
      return 'top';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    default:
      throw new Error(`Unknown handle side: ${side}`);
  }
};

export { createHandleId, createSourceHandleId, createTargetHandleId, oppositeHandleSide };
