import { Handle, Position } from '@xyflow/react';

export type HandleId =
  | 't-left'
  | 's-left'
  | 't-right'
  | 's-right'
  | 't-top'
  | 's-top'
  | 't-bottom'
  | 's-bottom';

const NodeHandles: React.FC = () => {
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
