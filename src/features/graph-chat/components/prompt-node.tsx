import { Button } from '@/components/ui/button/button';
import { Textarea } from '@/components/ui/textarea/textarea';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import React from 'react';
import { FiSend } from 'react-icons/fi';
import { useGraphContext } from '../contexts/graph-provider';
import { HandleSide } from '../types/handle';
import { NodeHandles } from './node-handles';

const PromptSendControls: React.FC<{
  onSendPrompt: (position: HandleSide) => void;
  isLoading: boolean;
}> = ({ onSendPrompt, isLoading }) => {
  return (
    <>
      <div
        className="absolute top-0 bottom-0 left-[-80px] w-[190px] cursor-pointer transition-opacity opacity-0 hover:opacity-100 flex items-center justify-start p-sm"
        onClick={() => onSendPrompt('left')}
      >
        <Button size="icon" className="rounded-full" aria-label="Add Node" disabled={isLoading}>
          <FiSend />
        </Button>
      </div>
      <div
        className="absolute top-0 bottom-0 right-[-80px] w-[190px]  cursor-pointer transition-opacity opacity-0 hover:opacity-100 flex items-center justify-end p-sm"
        onClick={() => onSendPrompt('right')}
      >
        <Button size="icon" className="rounded-full" aria-label="Add Node" disabled={isLoading}>
          <FiSend />
        </Button>
      </div>
    </>
  );
};

const PromptHandles: React.FC = () => {
  return (
    <>
      <Handle className="handle" id="t-left" type="target" position={Position.Left} />
      <Handle className="handle" id="s-left" type="source" position={Position.Left} />
      <Handle className="handle" id="t-right" type="target" position={Position.Right} />
      <Handle className="handle" id="s-right" type="source" position={Position.Right} />
      <Handle className="handle" id="t-top" type="target" position={Position.Top} />
      <Handle className="handle" id="s-top" type="source" position={Position.Top} />
      <Handle className="handle" id="t-bottom" type="target" position={Position.Bottom} />
      <Handle className="handle" id="s-bottom" type="source" position={Position.Bottom} />
    </>
  );
};

export { NodeHandles };

type PromptNodeType = Node<{ isLoading?: boolean; isEditable?: boolean; content?: string }>;

const PromptNode: React.FC<NodeProps<PromptNodeType>> = (props) => {
  const [prompt, setPrompt] = React.useState<string>('');

  const { onSendPrompt: _onSendPrompt } = useGraphContext();

  const onSendPrompt = (position: HandleSide) => {
    if (props.data.isEditable && prompt.trim() !== '') {
      _onSendPrompt({
        content: prompt,
        id: props.id,
        position,
      });
    }
  };

  return (
    <div className="relative bg-card rounded-b-lg shadow-md flex flex-col min-w-[250px] max-w-[300px] min-h-[100px]">
      <PromptHandles />
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
      {props.data.isEditable && prompt.length > 0 && (
        <PromptSendControls onSendPrompt={onSendPrompt} isLoading={!!props.data.isLoading} />
      )}
    </div>
  );
};

export { PromptNode };
