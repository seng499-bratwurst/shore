type HandleSide = 'top' | 'bottom' | 'left' | 'right';
type HandlePrefix = 's' | 't';
type HandleId = `${HandlePrefix}-${HandleSide}`;

export type { HandleId, HandleSide };
