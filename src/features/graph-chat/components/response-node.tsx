
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
  documents?: Array<{
    id: number;
    name: string;
    createdAt: string;
    uploadedBy: string;
    sourceLink: string;
    sourceType: string;
  }>;
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
    // Only convert standalone URLs that are not already in markdown format
    // This regex matches URLs that are:
    // 1. Not preceded by ]( (not already in a markdown link)
    // 2. Not inside square brackets [URL]
    // 3. Standalone URLs on their own or preceded by whitespace
    const urlRegex = /(?<!\]\()\b(https?:\/\/[^\s\[\]]+)(?!\))/g;
    
    return content.replace(urlRegex, (match, url) => {
      // Additional safety check: ensure we're not inside a markdown link
      const matchIndex = content.indexOf(match);
      const beforeMatch = content.substring(0, matchIndex);
      
      // Check if we're inside square brackets [...]
      const lastOpenBracket = beforeMatch.lastIndexOf('[');
      const lastCloseBracket = beforeMatch.lastIndexOf(']');
      
      if (lastOpenBracket > lastCloseBracket) {
        // We're inside square brackets, don't convert
        return match;
      }
      
      // Clean any trailing punctuation
      const cleanUrl = url.replace(/[`\])}.,;:!?]+$/, '');
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
    } else {
      alert('No API request URL found in this response.');
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
        
        {data.documents && data.documents.length > 0 && (
          <div className="references-section mt-xs pt-xs border-t border-border z-[1000] relative">
            <div className="text-xs font-medium text-muted-foreground mb-xs">References:</div>
            <div className="space-y-1">
              {data.documents.slice(0, 3).map((doc, index) => (
                <div key={doc.id} className="text-xs flex items-start gap-2">
                  <span className="font-medium text-primary min-w-[20px]">[{index + 1}]</span>
                  <div className="flex-1">
                    {doc.sourceLink ? (
                      <a 
                        href={doc.sourceLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline cursor-pointer z-[1001] relative"
                        title={`Open ${doc.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          window.open(doc.sourceLink, '_blank');
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {doc.name}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">{doc.name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-xs z-[1000] relative">
          <div className="flex">
            <Button
              className="group z-[1001] relative pointer-events-auto"
              title="Thumb Up"
              size="icon"
              variant="link"
              onClick={(e) => {
                e.stopPropagation();
                setThumb(thumb === 'up' ? null : 'up');
              }}
            >
              {thumb === 'up' ? (
                <FiThumbsUp className="w-icon-sm h-icon-xs text-card-foreground fill-brand-secondary" />
              ) : (
                <FiThumbsUp className="w-icon-sm h-icon-xs text-card-foreground fill-transparent group-hover:fill-brand-secondary/80" />
              )}
            </Button>
            <Button
              className="group z-[1001] relative pointer-events-auto"
              title="Thumb Down"
              size="icon"
              variant="link"
              onClick={(e) => {
                e.stopPropagation();
                setThumb(thumb === 'down' ? null : 'down');
              }}
            >
              {thumb === 'down' ? (
                <FiThumbsDown className="w-icon-sm h-icon-xs text-card-foreground fill-brand-secondary" />
              ) : (
                <FiThumbsDown className="w-icon-sm h-icon-xs text-card-foreground fill-transparent group-hover:fill-brand-secondary/80" />
              )}
            </Button>
          </div>
          <div className="flex">
            <Button 
              className="z-[1001] relative pointer-events-auto"
              size="icon" 
              variant="secondary" 
              title={extractUrls(data.content || '').length > 0 ? "View API Request" : "No API Request Available"}
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
            >
              <FiDownload className="w-icon-md h-icon-md text-secondary-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ResponseNode };