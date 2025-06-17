import { Position } from '@xyflow/react';
import React, { createContext, ReactNode, useContext } from 'react';

type OnAddNodeParams = {
  id: string;
  position: Position;
};
export type OnAddNode = (params: OnAddNodeParams) => void;

type GraphContextType = {
  onAddNode: OnAddNode;
};

const GraphContext = createContext<GraphContextType | undefined>(undefined);

type GraphProviderProps = {
  children: ReactNode;
  onAddNode: OnAddNode;
};

export const GraphProvider: React.FC<GraphProviderProps> = ({ children, onAddNode }) => {
  return <GraphContext.Provider value={{ onAddNode }}>{children}</GraphContext.Provider>;
};

export const useGraphContext = (): GraphContextType => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraphContext must be used within a GraphProvider');
  }
  return context;
};
