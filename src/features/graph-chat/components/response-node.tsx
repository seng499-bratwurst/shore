
import { Button } from '@/components/ui/button/button';
import { type Node, type NodeProps } from '@xyflow/react';
import React, { useEffect, useState } from 'react';
import { 
  FiExternalLink, FiPlus, FiThumbsDown, FiThumbsUp, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { useGraphContext } from '../contexts/graph-provider';
import { useGraphChatSettingsStore } from '../stores/graph-chat-settings-store';
import { HandleSide } from '../types/handle';
import { BaseNodeActions } from './node-edge-controls';
import { NodeHandles } from './node-handles';

type ResponseNodeType = Node<{ 
  content: string;
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpansion, setShowExpansion] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { settings } = useGraphChatSettingsStore();
  const { data } = props;

  const { onBranchResponse: _onBranchResponse } = useGraphContext();
  const onBranchResponse = (position: HandleSide) => {
    _onBranchResponse({
      id: props.id,
      handleSide: position,
    });
  };

  // Extract URLs from the content
  const extractUrls = (text: string): string[] => {
    const urlRegex = /https?:\/\/[^\s\]`]+/g;
    const urls = text.match(urlRegex) || [];
    return urls.map(url => url.replace(/[`\])}.,;:!?]+$/, ''));
  };

  // remove URL from response
  const cleanContentForDisplay = (content: string): string => {
    let cleaned = content.replace(/https?:\/\/[^\s\]`]+/g, '');
    
    cleaned = cleaned.replace(/Here is the URL.*/gi, '');
    
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n'); 
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.trim();
    
    return cleaned;
  };

  const handleOpenLink = () => {
    const urls = extractUrls(data.content || '');
    if (urls.length > 0) {
      // Open the first URL found in the content
      window.open(urls[0], '_blank');
    } else {
      alert('No API request URL found in this response.');
    }
  };
  
  useEffect(() => {
    if (contentRef.current) {
      const maxHeight = 192; // matching max-h-48
      const actualHeight = contentRef.current.scrollHeight;
      setShowExpansion(actualHeight > maxHeight);
    }
  }, [data.content]);

  // Get cleaned content and check if URLs exist
  const cleanedContent = cleanContentForDisplay(data.content);
  const hasUrls = extractUrls(data.content || '').length > 0;

  return (
    <div className="relative bg-card text-card-foreground rounded-b-lg shadow-md flex flex-col min-w-[100px] max-w-[600px]">
      <ResponseBranchControls onBranchResponse={onBranchResponse} />
      <NodeHandles settings={settings.response} />
      <div className="bg-secondary text-secondary-foreground w-full text-sm px-sm py-xs">
        Response
      </div>
      <div className="flex flex-col px-sm space-y-xs mt-xs pointer-events-auto relative z-50">
        <div 
            className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-none' : 'max-h-48'}`}
            ref={contentRef}
        >
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
            {cleanedContent}
          </ReactMarkdown>
        </div>
        {!isExpanded && showExpansion && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
        )}
          {showExpansion && (
            <div className="flex justify-center mt-xs">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs"
              >
                {isExpanded ? (
                  <>
                    <FiChevronUp className="w-3 h-3 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <FiChevronDown className="w-3 h-3 mr-1" />
                    Show More
                  </>
                )}
              </Button>
            </div>
          )}
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
              title={hasUrls ? "Open API Request" : "No API Request Available"}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenLink();
              }}
            >
              <FiExternalLink className="w-icon-md h-icon-md text-secondary-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ResponseNode };