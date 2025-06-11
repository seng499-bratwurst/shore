import { Handle, Position } from '@xyflow/react';

function NodeHandles() {
  return (
    <>
      <Handle
        className="!bg-card !border-neutral-200 dark:!border-neutral-700 !w-sm !h-sm"
        id="tl"
        type="target"
        position={Position.Left}
      />
      <Handle
        className="!bg-card !border-neutral-200 dark:!border-neutral-700 !w-sm !h-sm z-10"
        id="sl"
        type="source"
        position={Position.Left}
      />
      <Handle
        className="!bg-card !border-neutral-200 dark:!border-neutral-700 !w-sm !h-sm"
        id="tr"
        type="target"
        position={Position.Right}
      />
      <Handle
        className="!bg-card !border-neutral-200 dark:!border-neutral-700 !w-sm !h-sm z-10"
        id="sr"
        type="source"
        position={Position.Right}
      />
      <Handle
        className="!bg-card !border-neutral-200 dark:!border-neutral-700 !w-sm !h-sm"
        id="tt"
        type="target"
        position={Position.Top}
      />
      <Handle
        className="!bg-card !border-neutral-200 dark:!border-neutral-700 !w-sm !h-sm z-10"
        id="st"
        type="source"
        position={Position.Top}
      />
      <Handle
        className="!bg-card !border-neutral-200 dark:!border-neutral-700 !w-sm !h-sm"
        id="tb"
        type="target"
        position={Position.Bottom}
      />
      <Handle
        className="!bg-card !border-neutral-200 dark:!border-neutral-700 !w-sm !h-sm z-10"
        id="sb"
        type="source"
        position={Position.Bottom}
      />
    </>
  );
}

export { NodeHandles };
