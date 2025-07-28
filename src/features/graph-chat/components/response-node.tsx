import { Button } from '@/components/ui/button/button';
import { type Node, type NodeProps } from '@xyflow/react';
import React, { useState } from 'react';
import { FiDownload, FiPlus, FiThumbsDown, FiThumbsUp } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { useGraphContext } from '../contexts/graph-provider';
import { useGraphChatSettingsStore } from '../stores/graph-chat-settings-store';
import { HandleSide } from '../types/handle';
import { BaseNodeActions } from './node-edge-controls';
import { NodeHandles } from './node-handles';

type ResponseNodeType = Node<{ 
  content: string; 
  isStreaming?: boolean; 
  streamingContent?: string; 
}>;

const ResponseBranchControls: React.FC<{
  onBranchResponse: (position: HandleSide) => void;
}> = ({ onBranchResponse }) => {
  const { settings } = useGraphChatSettingsStore();

  return (
    <BaseNodeActions
      onAction={onBranchResponse}
      enabledSides={settings.response.outgoingSides}
      icon={FiPlus}
      buttonVariant="secondary"
    />
  );
};

const ResponseNode: React.FC<NodeProps<ResponseNodeType>> = (props) => {
  const [thumb, setThumb] = useState<'up' | 'down' | null>(null);
  const { settings } = useGraphChatSettingsStore();
  const { data } = props;

  const { onBranchResponse: _onBranchResponse } = useGraphContext();
  const onBranchResponse = (position: HandleSide) => {
    _onBranchResponse({
      id: props.id,
      handleSide: position,
    });
  };

  return (
    <div className="relative bg-card text-card-foreground rounded-b-lg shadow-md flex flex-col min-w-[100px] max-w-[300px]">
      <ResponseBranchControls onBranchResponse={onBranchResponse} />
      <NodeHandles settings={settings.response} />
      <div className="bg-secondary text-secondary-foreground w-full text-sm px-sm py-xs">
        Response
      </div>
      <div className="flex flex-col px-sm space-y-xs mt-xs">
        <ReactMarkdown>
          {data.isStreaming ? (data.streamingContent || '') : data.content}
        </ReactMarkdown>
        {data.isStreaming && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="animate-pulse w-2 h-2 bg-primary rounded-full"></div>
            <span>Astrolabe is thinking...</span>
          </div>
        )}
        <div className="flex justify-between items-center mb-xs">
          <div className="flex">
            <Button
              className="group"
              title="Thumb Up"
              size="icon"
              variant="link"
              onClick={() => setThumb(thumb === 'up' ? null : 'up')}
            >
              {thumb === 'up' ? (
                <FiThumbsUp className="w-icon-sm h-icon-xs text-card-foreground fill-brand-secondary" />
              ) : (
                <FiThumbsUp className="w-icon-sm h-icon-xs text-card-foreground fill-transparent group-hover:fill-brand-secondary/80" />
              )}
            </Button>
            <Button
              className="group"
              title="Thumb Down"
              size="icon"
              variant="link"
              onClick={() => setThumb(thumb === 'down' ? null : 'down')}
            >
              {thumb === 'down' ? (
                <FiThumbsDown className="w-icon-sm h-icon-xs text-card-foreground fill-brand-secondary" />
              ) : (
                <FiThumbsDown className="w-icon-sm h-icon-xs text-card-foreground fill-transparent group-hover:fill-brand-secondary/80" />
              )}
            </Button>
          </div>
          <Button size="icon" variant="secondary" title="Download">
            <FiDownload className="w-icon-md h-icon-md text-secondary-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export { ResponseNode };
