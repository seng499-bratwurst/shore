import { Handle, Position } from '@xyflow/react';
import { NodeTypeSettings } from '../hooks/save-graph-chat-settings';

const NodeHandles: React.FC<{ settings: NodeTypeSettings }> = ({ settings }) => {
  return (
    <>
      {/* Left handles */}
      {settings.incomingSides.left && (
        <Handle className="handle" id="t-left" type="target" position={Position.Left} />
      )}
      {settings.outgoingSides.left && (
        <Handle className="handle" id="s-left" type="source" position={Position.Left} />
      )}

      {/* Right handles */}
      {settings.incomingSides.right && (
        <Handle className="handle" id="t-right" type="target" position={Position.Right} />
      )}
      {settings.outgoingSides.right && (
        <Handle className="handle" id="s-right" type="source" position={Position.Right} />
      )}

      {/* Top handles */}
      {settings.incomingSides.top && (
        <Handle className="handle" id="t-top" type="target" position={Position.Top} />
      )}
      {settings.outgoingSides.top && (
        <Handle className="handle" id="s-top" type="source" position={Position.Top} />
      )}

      {/* Bottom handles */}
      {settings.incomingSides.bottom && (
        <Handle className="handle" id="t-bottom" type="target" position={Position.Bottom} />
      )}
      {settings.outgoingSides.bottom && (
        <Handle className="handle" id="s-bottom" type="source" position={Position.Bottom} />
      )}
    </>
  );
};

export { NodeHandles };
