import React, { createContext, ReactNode, useContext } from 'react';
import { HandleSide } from '../types/handle';

type OnAddNodeParams = {
  id: string;
  handleSide: HandleSide;
};

type OnSendPromptParams = {
  content: string;
  id: string;
  position: HandleSide;
};

export type OnBranchResponse = (params: OnAddNodeParams) => void;
export type OnSendPrompt = (params: OnSendPromptParams) => void;
export type onAutoLayout = () => void;

type GraphContextType = {
  onBranchResponse: OnBranchResponse;
  onSendPrompt: OnSendPrompt; // Optional, can be used for sending prompts
  onAutoLayout: onAutoLayout;
};

const GraphContext = createContext<GraphContextType | undefined>(undefined);

type GraphProviderProps = {
  children: ReactNode;
  onBranchResponse: OnBranchResponse;
  onSendPrompt: OnSendPrompt;
  onAutoLayout: onAutoLayout;
};

export const GraphProvider: React.FC<GraphProviderProps> = ({
  children,
  onBranchResponse,
  onSendPrompt,
  onAutoLayout,
}) => {
  return (
    <GraphContext.Provider value={{ onBranchResponse, onSendPrompt, onAutoLayout }}>
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
