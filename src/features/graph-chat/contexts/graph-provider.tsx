import { Position } from '@xyflow/react';
import React, { createContext, ReactNode, useContext } from 'react';

type OnAddNodeParams = {
  id: string;
  position: Position;
};

type OnSendPromptParams = {
  content: string;
  id: string;
  position: Position;
};

export type OnBranchResponse = (params: OnAddNodeParams) => void;
export type OnSendPrompt = (params: OnSendPromptParams) => void;

type GraphContextType = {
  onBranchResponse: OnBranchResponse;
  onSendPrompt: OnSendPrompt; // Optional, can be used for sending prompts
};

const GraphContext = createContext<GraphContextType | undefined>(undefined);

type GraphProviderProps = {
  children: ReactNode;
  onBranchResponse: OnBranchResponse;
  onSendPrompt: OnSendPrompt;
};

export const GraphProvider: React.FC<GraphProviderProps> = ({
  children,
  onBranchResponse,
  onSendPrompt,
}) => {
  return (
    <GraphContext.Provider value={{ onBranchResponse, onSendPrompt }}>
      {children}
    </GraphContext.Provider>
  );
};

export const useGraphContext = (): GraphContextType => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraphContext must be used within a GraphProvider');
  }
  return context;
};
