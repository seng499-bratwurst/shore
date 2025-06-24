import { Button } from '@/components/ui/button/button';
import { Node, NodeProps } from '@xyflow/react';
import { FiPlus } from 'react-icons/fi';
import { useGraphContext } from '../contexts/graph-provider';

const NodeEdgeControls: React.FC<NodeProps<Node>> = ({ id }) => {
  const { onBranchResponse } = useGraphContext();
  return (
    <>
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[-60px] h-[60px] w-[50px] cursor-pointer transition-opacity opacity-0 hover:opacity-100 flex justify-center items-start p-sm"
        onClick={() => onBranchResponse({ id, handleSide: 'top' })}
      >
        <Button variant="secondary" size="icon" className="rounded-full" aria-label="Add Node">
          <FiPlus className="w-6 h-6 text-secondary-foreground" />
        </Button>
      </div>
      <div
        className="absolute top-1/2 -translate-y-1/2 left-[-60px] h-[50px] w-[60px] cursor-pointer transition-opacity opacity-0 hover:opacity-100 flex items-center justify-start p-sm"
        onClick={() => onBranchResponse({ id, handleSide: 'left' })}
      >
        <Button variant="secondary" size="icon" className="rounded-full" aria-label="Add Node">
          <FiPlus className="w-6 h-6 text-secondary-foreground" />
        </Button>
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-[-60px] h-[60px] w-[50px] cursor-pointer transition-opacity opacity-0 hover:opacity-100 flex justify-center items-end p-sm"
        onClick={() => onBranchResponse({ id, handleSide: 'bottom' })}
      >
        <Button variant="secondary" size="icon" className="rounded-full" aria-label="Add Node">
          <FiPlus className="w-6 h-6 text-secondary-foreground" />
        </Button>
      </div>
      <div
        className="absolute top-1/2 -translate-y-1/2 right-[-60px] h-[50px] w-[60px] cursor-pointer transition-opacity opacity-0 hover:opacity-100 flex items-center justify-end p-sm"
        onClick={() => onBranchResponse({ id, handleSide: 'right' })}
      >
        <Button variant="secondary" size="icon" className="rounded-full" aria-label="Add Node">
          <FiPlus className="w-6 h-6 text-secondary-foreground" />
        </Button>
      </div>
    </>
  );
};

export { NodeEdgeControls };
