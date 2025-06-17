import { Button } from '@/components/ui/button/button';
import { Textarea } from '@/components/ui/textarea/textarea';
import type { Node, NodeProps } from '@xyflow/react';
import React from 'react';
import { FiSend } from 'react-icons/fi';
import { NodeHandles } from './node-handles';

type PromptNodeType = Node;

const PromptNode: React.FC<NodeProps<PromptNodeType>> = (props) => {
  return (
    <div className="relative bg-card rounded-b-lg shadow-md flex flex-col min-w-[250px] max-w-[300px] min-h-[100px]">
      <NodeHandles />
      <div className="bg-primary text-primary-foreground w-full text-sm px-sm py-xs">Prompt</div>
      <div className="bg-card p-xs">
        <Textarea
          className="flex-1 px-sm py-2xs text-sm !bg-card border-none focus:ring-0 resize-none"
          placeholder="Type your prompt here..."
        />
      </div>
      <div className="flex justify-end px-sm pb-xs">
        <Button size="icon" variant="default" aria-label="Send">
          <FiSend />
        </Button>
      </div>
    </div>
  );
};

export { PromptNode };
