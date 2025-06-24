import { Button } from '@/components/ui/button/button';
import { Textarea } from '@/components/ui/textarea/textarea';
import { Position, type Node, type NodeProps } from '@xyflow/react';
import React from 'react';
import { FiSend } from 'react-icons/fi';
import { useGraphContext } from '../contexts/graph-provider';
import { NodeHandles } from './node-handles';

type PromptNodeType = Node<{ isLoading?: boolean; isEditable?: boolean; content?: string }>;

const PromptNode: React.FC<NodeProps<PromptNodeType>> = (props) => {
  const [prompt, setPrompt] = React.useState<string>('');

  const { onSendPrompt } = useGraphContext();

  const handleSendPrompt = () => {
    if (prompt.trim() === '') return;

    onSendPrompt({
      content: prompt,
      id: props.id,
      position: Position.Top,
    });
  };

  return (
    <div className="relative bg-card rounded-b-lg shadow-md flex flex-col min-w-[250px] max-w-[300px] min-h-[100px]">
      <NodeHandles />
      <div className="bg-primary text-primary-foreground w-full text-sm px-sm py-xs">Prompt</div>
      <div className="bg-card p-xs">
        {props.data.isEditable ? (
          <Textarea
            className="flex-1 px-sm py-2xs text-sm !bg-card border-none focus:ring-0 resize-none"
            placeholder="Type your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={props.data.isLoading}
          />
        ) : (
          props.data.content
        )}
      </div>
      {props.data.isEditable && (
        <div className="flex justify-end px-sm pb-xs">
          <Button
            disabled={props.data.isLoading}
            size="icon"
            variant="default"
            aria-label="Send"
            onClick={handleSendPrompt}
          >
            <FiSend />
          </Button>
        </div>
      )}
    </div>
  );
};

export { PromptNode };
