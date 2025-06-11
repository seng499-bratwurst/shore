import { Handle, Position } from '@xyflow/react';

const NodeHandles: React.FC = () => {
  return (
    <>
      <Handle className="handle" id="tl" type="target" position={Position.Left} />
      <Handle className="handle" id="sl" type="source" position={Position.Left} />
      <Handle className="handle" id="tr" type="target" position={Position.Right} />
      <Handle className="handle" id="sr" type="source" position={Position.Right} />
      <Handle className="handle" id="tt" type="target" position={Position.Top} />
      <Handle className="handle" id="st" type="source" position={Position.Top} />
      <Handle className="handle" id="tb" type="target" position={Position.Bottom} />
      <Handle className="handle" id="sb" type="source" position={Position.Bottom} />
    </>
  );
};

export { NodeHandles };
