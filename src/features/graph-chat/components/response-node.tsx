import { Button } from '@/components/ui/button/button';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import React, { useState } from 'react';
import { FiDownload, FiPlus, FiThumbsDown, FiThumbsUp } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { useGraphContext } from '../contexts/graph-provider';
import { HandleSide } from '../types/handle';

type ResponseNodeType = Node<{ content: string }>;

// Dummy temperature data until we get LLM integrated
const tempData = [
  ['11:00am', -10],
  ['12:00pm', -9],
  ['1:00pm', -7],
  ['2:00pm', -5],
  ['3:00pm', -3],
];

const ResponseBranchControls: React.FC<{
  onBranchResponse: (position: HandleSide) => void;
}> = ({ onBranchResponse }) => {
  return (
    <>
      <div
        className="absolute left-0 right-0 bottom-1/2 top-[-80px] cursor-pointer transition-opacity opacity-0 hover:opacity-100 flex flex-col items-center justify-start p-sm"
        onClick={() => onBranchResponse('top')}
      >
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full"
          aria-label="Add Prompt Node"
        >
          <FiPlus />
        </Button>
      </div>
      <div
        className="absolute left-0 right-0 bottom-[-80px] top-1/2 cursor-pointer transition-opacity opacity-0 hover:opacity-100 flex flex-col items-center justify-end p-sm"
        onClick={() => onBranchResponse('bottom')}
      >
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full"
          aria-label="Add Prompt Node"
        >
          <FiPlus />
        </Button>
      </div>
    </>
  );
};

const ResponseHandles: React.FC = () => {
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

const ResponseNode: React.FC<NodeProps<ResponseNodeType>> = (props) => {
  const [thumb, setThumb] = useState<'up' | 'down' | null>(null);
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
      <ResponseHandles />
      <div className="bg-secondary text-secondary-foreground w-full text-sm px-sm py-xs">
        Response
      </div>
      <div className="flex flex-col px-sm space-y-xs mt-xs">
        <ReactMarkdown>{data.content}</ReactMarkdown>
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
