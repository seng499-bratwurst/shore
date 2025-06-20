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
import type { Edge as _Edge, Node, NodePositionChange } from '@xyflow/react';
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCreatePrompt } from '../api/create-prompt';
import { useGetConversationEdges } from '../api/get-conversation-edges';
import { useGetConversationMessages } from '../api/get-conversation-messages';
import { useUpdateMessage } from '../api/update-message';
import { HandleId, HandleSide } from '../types/handle';
import { Message } from '../types/message';
import GraphControls from './graph-controls';

const nodeTypes = { prompt: PromptNode, response: ResponseNode };

type GraphChatProps = {
  conversationId?: number | undefined;
};

type ReactFlowEdge = Omit<_Edge, 'sourceHandle' | 'targetHandle'> & {
  sourceHandle: HandleId;
  targetHandle: HandleId;
};

const GraphChat: React.FC<GraphChatProps> = ({ conversationId: _conversationId }) => {
  const [conversationId, setConversationId] = useState(_conversationId);

  const queryClient = useQueryClient();
  const pendingUpdatesRef = useRef<Record<string, NodePositionChange>>({});

  const { data: messageEdges, isFetched: edgesAreFetched } = useGetConversationEdges(
    conversationId || 0,
    {
      enabled: !!conversationId,
    }
  );

  const { data: messages, isFetched: messagesAreFetched } = useGetConversationMessages(
    conversationId || 0,
    {
      enabled: !!conversationId,
    }
  );

  const persistentMessageIds = useMemo(() => {
    return new Set(messages?.map((msg) => msg.id.toString()) || []);
  }, [messages]);

  const updateMessage = useUpdateMessage(conversationId || 0);

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

  const [edges, setEdges] = useState<ReactFlowEdge[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);

  const [tempPromptEdges, setTempPromptEdges] = useState<ReactFlowEdge[]>([]);

  useEffect(() => {
    if (messagesAreFetched && edgesAreFetched) {
      console.log('Setting initial nodes and edges:', {
        messages: messages?.length,
        edges: messageEdges?.length,
      });

      const _nodes = (messages || []).map((message) => ({
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

      const _edges: ReactFlowEdge[] = (messageEdges || []).map((edge) => ({
        id: edge.id.toString(),
        source: edge.sourceMessageId.toString(),
        target: edge.targetMessageId.toString(),
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      }));

      setNodes(_nodes);
      setEdges(_edges);
    }
  }, [messagesAreFetched, edgesAreFetched]);

  const handleNodeUpdates = useCallback(
    (changes: NodePositionChange[]) => {
      console.log('Handling node updates:', {
        nodes,
        changes,
        qk: ['conversation-messages', conversationId],
      });
      setNodes((nds) => applyNodeChanges(changes, nds));

      // Optimistic update
      queryClient.setQueryData<Message[]>(
        ['conversation-messages', conversationId],
        (prevNodes) => {
          if (!prevNodes) return [];
          const updateMap = Object.fromEntries(changes.map((n) => [n.id, n.position]));
          return prevNodes.map((node) =>
            updateMap[node.id] ? { ...node, position: updateMap[node.id] } : node
          );
        }
      );

      // Queue changes for throttled send
      changes.forEach((node) => {
        pendingUpdatesRef.current[node.id] = node;
      });

      throttledFlush();
    },
    [queryClient, throttledFlush, conversationId, nodes]
  );

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));

      const persistantMessageUpdates = changes
        .filter((change) => change.type === 'position' && persistentMessageIds.has(change.id))
        .map((change) => change as NodePositionChange);

      if (persistantMessageUpdates.length > 0) {
        handleNodeUpdates(persistantMessageUpdates);
      }
    },
    [handleNodeUpdates, persistentMessageIds, setNodes]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      const sourceNode = nodes.find(
        (node) => node.id === connection.source && node.type === 'response'
      );
      const destinationNode = nodes.find(
        (node) => node.id === connection.target && node.type === 'prompt'
      );
      if (sourceNode && destinationNode) {
        setTempPromptEdges((eds) =>
          addEdge<ReactFlowEdge>(
            {
              ...connection,
              sourceHandle: connection.sourceHandle,
              targetHandle: connection.targetHandle,
            },
            eds
          )
        );
      }
    },
    [nodes, edges, setTempPromptEdges]
  );

  // need to implement when responses show up
  const onAddNode: OnBranchResponse = useCallback(
    ({ id, position }) => {
      const node = nodes.find((n) => n.id === id);
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

      setTempPromptEdges((eds) =>
        eds.concat({
          id: `e${node.id}-${tempNodeId}`,
          source: node.id,
          target: tempNodeId,
          sourceHandle: `s-${sourceHandle}`,
          targetHandle: `t-${targetHandle}`,
        })
      );

      setNodes((nds) =>
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
    [setTempPromptEdges, edges, setNodes, nodes, nodes]
  );

  const onSendPrompt: OnSendPrompt = useCallback(
    ({ id, position, content }) => {
      const node = nodes.find((n) => n.id === id);
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
          targetHandle: `t-${responseHandle}`,
          responseXCoordinate,
          responseYCoordinate,
          sourceHandle: `s-${sourceHandle}`,
          conversationId: conversationId || 0,
          sources: tempPromptEdges
            .filter((edge) => edge.target === node.id)
            .map((edge) => ({
              sourceMessageId: parseInt(edge.source),
              sourceHandle: edge.sourceHandle as HandleId,
              targetHandle: edge.targetHandle as HandleId,
            })),
        },
        {
          onSettled: (data, _, variables) => {
            console.log('Prompt created:', data);
            if (data) {
              setConversationId(data.conversationId);
              setNodes((nds) => nds.filter((n) => n.id !== node.id));
              setNodes((nds) =>
                nds.concat([
                  {
                    id: data.responseMessageId.toString(),
                    position: {
                      x: variables.responseXCoordinate,
                      y: variables.responseYCoordinate,
                    },
                    data: {
                      content: data.response,
                      oncApiQuery: '',
                      oncApiResponse: '',
                    },
                    type: 'response',
                    draggable: true,
                  },
                  {
                    id: data.promptMessageId.toString(),
                    position: {
                      x: variables.xCoordinate,
                      y: variables.yCoordinate,
                    },
                    data: {
                      content: variables.content,
                      isEditable: false,
                      isLoading: false,
                    },
                    type: 'prompt',
                    draggable: true,
                  },
                ])
              );
              setEdges((eds) =>
                eds.concat([
                  ...data.createdEdges.map((edge) => ({
                    id: edge.id.toString(),
                    source: edge.sourceMessageId.toString(),
                    target: edge.targetMessageId.toString(),
                    sourceHandle: edge.sourceHandle,
                    targetHandle: edge.targetHandle,
                  })),
                  ...variables.sources.map((source) => ({
                    id: `e${source.sourceMessageId}-${data.promptMessageId}`,
                    source: source.sourceMessageId.toString(),
                    target: data.promptMessageId.toString(),
                    sourceHandle: source.sourceHandle,
                    targetHandle: source.targetHandle,
                  })),
                ])
              );
              // Remove temporary prompt edges
              setTempPromptEdges((eds) => eds.filter((e) => e.target !== node.id));
            }
          },
          onError: (error) => {
            console.error('Error creating prompt:', error);
            // Optionally, you can reset the loading state or show an error message
            setNodes((nds) =>
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
      setNodes((nds) =>
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
    [nodes, createPrompt, edges, setNodes, setEdges, setTempPromptEdges, conversationId]
  );
  console.log({ conversationId, nodes, edges, tempPromptEdges, tempPromptNodes: nodes });

  const allNodes = useMemo(() => {
    return nodes.concat(nodes);
  }, [nodes, nodes]);

  const allEdges = useMemo(() => {
    return edges.concat(tempPromptEdges);
  }, [edges, tempPromptEdges]);

  return (
    <div className="h-full w-full">
      <GraphProvider onBranchResponse={onAddNode} onSendPrompt={onSendPrompt}>
        <ReactFlow
          nodes={allNodes}
          edges={allEdges}
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
              setNodes((nds) =>
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
