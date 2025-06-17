'use client';
import '@/app/globals.css';
import { PromptNode } from '@/features/graph-chat/components/prompt-node';
import { ResponseNode } from '@/features/graph-chat/components/response-node';
import { GraphProvider, OnAddNode } from '@/features/graph-chat/contexts/graph-provider';
import type { Edge, Node } from '@xyflow/react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  Position,
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useState } from 'react';

const nodeTypes = { prompt: PromptNode, response: ResponseNode };

// Dummy nodes for testing
const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    data: { sources: [{ name: 'Ocean Networks Canada', url: 'google.com' }] },
    type: 'response',
  },
  { id: '2', position: { x: 300, y: 200 }, data: {}, type: 'prompt' },
  {
    id: '3',
    position: { x: 300, y: 400 },
    data: { sources: [{ name: 'Ocean Networks Canada', url: 'google.com' }] },
    type: 'response',
  },
];

// Dummy edges for testing
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', sourceHandle: 'sr', targetHandle: 'tl', target: '2' },
  { id: 'e3-2', source: '3', sourceHandle: 'sr', targetHandle: 'tl', target: '2' },
];

function GraphChat() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onAddNode: OnAddNode = useCallback(
    ({ id, position }) => {
      const existingNode = nodes.find((node) => node.id === id);
      if (existingNode) {
        const newNode: Node = {
          id: `${Date.now()}`, // Unique ID for the new node
          position: { x: 0, y: 0 },
          data: {},
          type: 'prompt',
        };
        let sourceHandle = '';
        let targetHandle = '';

        // Adjust position based on side
        if (position === Position.Left) {
          newNode.position.x = existingNode.position.x - 300;
          newNode.position.y = existingNode.position.y;
          sourceHandle = 'sl';
          targetHandle = 'tr';
        } else if (position === Position.Right) {
          newNode.position.x = existingNode.position.x + 300;
          newNode.position.y = existingNode.position.y;
          sourceHandle = 'sr';
          targetHandle = 'tl';
        } else if (position === Position.Top) {
          newNode.position.y = existingNode.position.y - 200;
          newNode.position.x = existingNode.position.x;
          sourceHandle = 'st';
          targetHandle = 'tb';
        } else if (position === Position.Bottom) {
          newNode.position.y = existingNode.position.y + 400;
          newNode.position.x = existingNode.position.x;
          sourceHandle = 'sb';
          targetHandle = 'tt';
        }
        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({
            id: `e${existingNode.id}-${newNode.id}`,
            source: existingNode.id,
            target: newNode.id,
            sourceHandle,
            targetHandle,
          })
        );
      } else {
        console.error(`Node with id ${id} does not exist.`);
      }
    },
    [setNodes, nodes]
  );

  return (
    <GraphProvider onAddNode={onAddNode}>
      <div className="h-[600px] w-full mt-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable
        >
          <Background />
          <Controls className="bg-background" />
        </ReactFlow>
      </div>
    </GraphProvider>
  );
}

export { GraphChat };
