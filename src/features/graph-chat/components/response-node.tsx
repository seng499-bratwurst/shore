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
  oncApiQuery?: string; 
  oncApiResponse?: string; 
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

  // Function to automatically convert URLs to markdown links
  const preprocessContent = (content: string): string => {
    // Regex to match URLs that are not already in markdown link format
    const urlRegex = /(?<!\]\()(https?:\/\/[^\s\]]+)(?!\))/g;
    
    return content.replace(urlRegex, (url) => {
      // Clean any trailing punctuation/backticks
      const cleanUrl = url.replace(/[`\])}]+$/, '');
      return `[${cleanUrl}](${cleanUrl})`;
    });
  };

  // Extract URLs from the content for download functionality
  const extractUrls = (text: string): string[] => {
    // Remove markdown code blocks and backticks first
    const cleanText = text.replace(/```[\s\S]*?```/g, '').replace(/`([^`]*)`/g, '$1');
    const urlRegex = /https?:\/\/[^\s\]`]+/g;
    const urls = cleanText.match(urlRegex) || [];
    // Clean any trailing backticks or punctuation
    return urls.map(url => url.replace(/[`\])}]+$/, ''));
  };

  const handleDownload = () => {
    const urls = extractUrls(data.content || '');
    if (urls.length > 0) {
      // Open the first URL found in the content
      window.open(urls[0], '_blank');
    } else if (data.oncApiResponse) {
      // If no URLs in content but we have ONC API response, try to extract from there
      const oncUrls = extractUrls(data.oncApiResponse);
      if (oncUrls.length > 0) {
        window.open(oncUrls[0], '_blank');
      }
    }
  };

  return (
    <div className="relative bg-card text-card-foreground rounded-b-lg shadow-md flex flex-col min-w-[100px] max-w-[300px]">
      <ResponseBranchControls onBranchResponse={onBranchResponse} />
      <NodeHandles settings={settings.response} />
      <div className="bg-secondary text-secondary-foreground w-full text-sm px-sm py-xs">
        Response
      </div>
      <div className="flex flex-col px-sm space-y-xs mt-xs select-text pointer-events-auto relative z-50">
        <ReactMarkdown
          components={{
            a: ({ ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer relative z-50"
                style={{ 
                  pointerEvents: 'auto', 
                  zIndex: 50,
                  position: 'relative'
                }}
              />
            ),
          }}
        >
          {preprocessContent(data.content)}
        </ReactMarkdown>
        <div className="flex justify-between items-center mb-xs">
          <div className="flex">
            <Button
              className="group pointer-events-auto"
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
              className="group pointer-events-auto"
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
          <Button 
            size="icon" 
            variant="secondary" 
            title="Download"
            onClick={handleDownload}
            className="pointer-events-auto"
          >
            <FiDownload className="w-icon-md h-icon-md text-secondary-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export { ResponseNode };
