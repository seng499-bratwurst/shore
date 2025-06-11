'use client';
import '@/app/globals.css';
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
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useState } from 'react';
import { AnswerNode } from './answer-node';
import { QuestionNode } from './question-node';

const nodeTypes = { question: QuestionNode, answer: AnswerNode };

// Dummy nodes for testing
const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    data: { sources: [{ name: 'Ocean Networks Canada', url: 'google.com' }] },
    type: 'answer',
  },
  { id: '2', position: { x: 300, y: 200 }, data: {}, type: 'question' },
  {
    id: '3',
    position: { x: 300, y: 400 },
    data: { sources: [{ name: 'Ocean Networks Canada', url: 'google.com' }] },
    type: 'answer',
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

  return (
    <>
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
    </>
  );
}

export { GraphChat };
