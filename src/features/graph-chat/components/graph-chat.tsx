'use client';
import '@/app/globals.css';
import { Button } from '@/components/ui/button/button';
import { PromptNode } from '@/features/graph-chat/components/prompt-node';
import { ResponseNode } from '@/features/graph-chat/components/response-node';
import {
  GraphProvider,
  OnBranchResponse,
  OnSendPrompt,
} from '@/features/graph-chat/contexts/graph-provider';
import { useQueryClient } from '@tanstack/react-query';
import type { Edge, Node, NodePositionChange } from '@xyflow/react';
import {
  addEdge,
  applyNodeChanges,
  Background,
  OnConnect,
  OnNodesChange,
  Position,
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { throttle } from 'lodash';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useCreatePrompt } from '../api/create-prompt';
import { useGetConversationEdges } from '../api/get-conversation-edges';
import { useGetConversationMessages } from '../api/get-conversation-messages';
import { useUpdateMessage } from '../api/update-message';
import { HandleSide } from '../types/handle';
import { Message } from '../types/message';
import GraphControls from './graph-controls';

const nodeTypes = { prompt: PromptNode, response: ResponseNode };

type GraphChatProps = {
  conversationId?: number | undefined;
};

const GraphChat: React.FC<GraphChatProps> = ({ conversationId: _conversationId }) => {
  const [conversationId, setConversationId] = useState(_conversationId);

  const queryClient = useQueryClient();
  const pendingUpdatesRef = useRef<Record<string, NodePositionChange>>({});

  const { data: messageEdges } = useGetConversationEdges(conversationId || 0, {
    enabled: !!conversationId,
  });
  const _edges: Edge[] = useMemo(() => {
    return [...(messageEdges || [])]?.map((edge) => ({
      id: edge.id.toString(),
      source: edge.sourceMessageId.toString(),
      target: edge.targetMessageId.toString(),
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    }));
  }, [messageEdges]);

  const { data: messages } = useGetConversationMessages(conversationId || 0, {
    enabled: !!conversationId,
  });

  const _nodes: Node[] = useMemo(() => {
    return [...(messages || [])]?.map((message) => ({
      type: message.role === 'assistant' ? 'response' : 'prompt',
      position: { x: message.xCoordinate, y: message.yCoordinate },
      data: {
        content: message.content,
        oncApiQuery: message.oncApiQuery,
        oncApiResponse: message.oncApiResponse,
      },
      id: message.id.toString(),
      draggable: true,
      deleteable: false,
    }));
  }, [messages]);

  const updateMessage = useUpdateMessage(conversationId || 0);

  // Ref to always have latest nodes state in debounced function
  // const nodesRef = useRef<Node[]>(_nodes);
  // useEffect(() => {
  //   nodesRef.current = nodes;
  // }, [_nodes]);

  const throttledFlush = useRef(
    throttle(
      () => {
        const updates = { ...pendingUpdatesRef.current };
        pendingUpdatesRef.current = {};

        Object.entries(updates).forEach(([id, { position }]) => {
          // console.log('Throttled update for message:', id, position);
          if (!position) return;
          updateMessage.mutate({
            id: parseInt(id),
            xCoordinate: position.x,
            yCoordinate: position.y,
          });
        });
      },
      1000,
      { leading: false, trailing: true }
    )
  ).current;
  const createPrompt = useCreatePrompt(conversationId || 0, {
    onSettled: (data) => setConversationId(data?.conversationId || 0),
  });

  const [tempEdges, setTempEdges] = useState<Edge[]>([]);
  const [tempNodes, setTempNodes] = useState<Node[]>([]);

  const edges: Edge[] = useMemo(() => {
    return [..._edges, ...tempEdges];
  }, [_edges, tempEdges]);

  const nodes: Node[] = useMemo(() => {
    return [..._nodes, ...tempNodes];
  }, [_nodes, tempNodes]);

  const handleNodeUpdates = useCallback(
    (nodes: NodePositionChange[]) => {
      // console.log('Handling node updates:', {
      //   nodes,
      //   qk: ['conversation-messages', conversationId],
      // });

      // Optimistic update
      queryClient.setQueryData<Message[]>(
        ['conversation-messages', conversationId],
        (prevNodes) => {
          if (!prevNodes) return [];
          const updateMap = Object.fromEntries(nodes.map((n) => [n.id, n.position]));
          return prevNodes.map((node) =>
            updateMap[node.id] ? { ...node, position: updateMap[node.id] } : node
          );
        }
      );

      // Queue changes for throttled send
      nodes.forEach((node) => {
        pendingUpdatesRef.current[node.id] = node;
      });

      throttledFlush();
    },
    [queryClient, throttledFlush, conversationId]
  );

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setTempNodes((nds) => applyNodeChanges(changes, nds));

      // Collect all position changes
      const positionUpdates = changes
        .filter((change) => change.type === 'position' && change.position)
        .map((change) => change as NodePositionChange);
      if (positionUpdates.length > 0) {
        handleNodeUpdates(positionUpdates);
      }
    },
    [setTempNodes, handleNodeUpdates]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => () => {
      const sourceNode = nodes.find(
        (node) => node.id === connection.source && node.type === 'response'
      );
      const destinationNode = tempNodes.find(
        (node) => node.id === connection.target && node.type === 'prompt'
      );
      if (!sourceNode || !destinationNode) {
        return;
      }
      tempEdges.push({
        id: `e${sourceNode.id}-${destinationNode.id}`,
        source: sourceNode.id,
        target: destinationNode.id,
        sourceHandle: connection.sourceHandle as HandleSide,
        targetHandle: connection.targetHandle as HandleSide,
      });
      setTempEdges((eds) => addEdge(connection, eds));
    },
    [nodes, tempNodes, tempEdges, setTempEdges]
  );

  // need to implement when responses show up
  const onAddNode: OnBranchResponse = useCallback(
    ({ id, position }) => {
      const node = _nodes.find((n) => n.id === id);
      if (!node) return;
      let sourceHandle: HandleSide = 'left';
      let targetHandle: HandleSide = 'left';
      let promptXCoordinate = 0;
      let promptYCoordinate = 0;
      if (position === Position.Left) {
        promptXCoordinate = node.position.x - 300;
        promptYCoordinate = node.position.y;
        sourceHandle = 'left';
        targetHandle = 'right';
      } else if (position === Position.Right) {
        promptXCoordinate = node.position.x + 300;
        promptYCoordinate = node.position.y;
        sourceHandle = 'right';
        targetHandle = 'left';
      } else if (position === Position.Top) {
        promptYCoordinate = node.position.y - 200;
        promptXCoordinate = node.position.x;
        sourceHandle = 'top';
        targetHandle = 'bottom';
      } else if (position === Position.Bottom) {
        promptYCoordinate = node.position.y + 400;
        promptXCoordinate = node.position.x;
        sourceHandle = 'bottom';
        targetHandle = 'top';
      }

      const tempNodeId = `${Date.now()}`;

      setTempEdges((eds) =>
        eds.concat({
          id: `e${node.id}-${tempNodeId}`,
          source: node.id,
          target: tempNodeId,
          sourceHandle: `s-${sourceHandle}`,
          targetHandle: `t-${targetHandle}`,
        })
      );

      setTempNodes((nds) =>
        nds.concat({
          id: tempNodeId,
          position: { x: promptXCoordinate, y: promptYCoordinate },
          data: {
            isEditable: true,
            isLoading: false,
          },
          type: 'prompt',
          draggable: true,
        })
      );
    },
    [setTempEdges, tempEdges, setTempNodes, tempNodes, nodes]
  );

  const onSendPrompt: OnSendPrompt = useCallback(
    ({ id, position, content }) => {
      const node = tempNodes.find((n) => n.id === id);
      if (!node) return;
      let sourceHandle: HandleSide = 'left';
      let responseHandle: HandleSide = 'left';
      let responseXCoordinate = 0;
      let responseYCoordinate = 0;

      // Adjust position based on side
      if (position === Position.Right) {
        responseXCoordinate = node.position.x - 300;
        responseYCoordinate = node.position.y;
        sourceHandle = 'left';
        responseHandle = 'right';
      } else if (position === Position.Left) {
        responseXCoordinate = node.position.x + 300;
        responseYCoordinate = node.position.y;
        sourceHandle = 'right';
        responseHandle = 'left';
      } else if (position === Position.Bottom) {
        responseYCoordinate = node.position.y - 200;
        responseXCoordinate = node.position.x;
        sourceHandle = 'top';
        responseHandle = 'bottom';
      } else if (position === Position.Top) {
        responseYCoordinate = node.position.y + 400;
        responseXCoordinate = node.position.x;
        sourceHandle = 'bottom';
        responseHandle = 'top';
      }
      createPrompt.mutate(
        {
          content,
          xCoordinate: node.position.x,
          yCoordinate: node.position.y,
          responseHandle: responseHandle,
          responseXCoordinate,
          responseYCoordinate,
          promptHandle: sourceHandle,
          conversationId: conversationId || 0,
          sources: tempEdges
            .filter((edge) => edge.target === node.id)
            .map((edge) => ({
              sourceMessageId: parseInt(edge.source),
              sourceHandle: edge.sourceHandle as HandleSide,
              targetHandle: edge.targetHandle as HandleSide,
            })),
        },
        {
          onSettled: (data) => {
            console.log('Prompt created:', data);
            if (data) {
              setConversationId(data.conversationId);
              setTempNodes((nds) => nds.filter((n) => n.id !== node.id));
              setTempEdges((eds) => eds.filter((e) => e.target !== node.id));
            }
          },
          onError: (error) => {
            console.error('Error creating prompt:', error);
            // Optionally, you can reset the loading state or show an error message
            setTempNodes((nds) =>
              nds.map((n) =>
                n.id === node.id
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        isLoading: false,
                      },
                    }
                  : n
              )
            );
          },
        }
      );

      // Set the prompt node to loading state
      setTempNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? {
                ...n,
                data: {
                  ...n.data,
                  isLoading: true,
                },
              }
            : n
        )
      );
      // setTempNodes((nds) => nds.filter((n) => n.id !== node.id));
      // setTempEdges((eds) => eds.filter((e) => e.target !== node.id));
    },
    [tempNodes, createPrompt]
  );
  // console.log({ conversationId, _nodes, edges, tempNodes, tempEdges });

  return (
    <div className="h-full w-full">
      <GraphProvider onBranchResponse={onAddNode} onSendPrompt={onSendPrompt}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          // onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          nodesFocusable={false}
          fitView
          nodesDraggable
        >
          <Background />
          <GraphControls />
          <Button
            className="absolute top-4 left-4 z-10 flex justify-center items-center"
            onClick={() =>
              setTempNodes((nds) =>
                nds.concat({
                  id: `${Date.now()}`,
                  position: { x: 100, y: 100 },
                  data: {
                    isEditable: true,
                    isLoading: false,
                  },
                  type: 'prompt',
                  draggable: true,
                })
              )
            }
          >
            New Prompt
          </Button>
        </ReactFlow>
      </GraphProvider>
    </div>
  );
};

export { GraphChat };
