'use client';
import '@/app/globals.css';
import { Button } from '@/components/ui/button/button';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { PromptNode } from '@/features/graph-chat/components/prompt-node';
import { ResponseNode } from '@/features/graph-chat/components/response-node';
import {
  GraphProvider,
  OnBranchResponse,
  OnSendPrompt,
} from '@/features/graph-chat/contexts/graph-provider';
import { useQueryClient } from '@tanstack/react-query';
import type { EdgeAddChange, EdgeRemoveChange, Node, NodePositionChange } from '@xyflow/react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  OnConnect,
  OnNodesChange,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { throttle } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCreatePrompt } from '../api/create-prompt';
import { useGetConversationEdges } from '../api/get-conversation-edges';
import {
  createConversationMessagesQueryKey,
  useGetConversationMessages,
} from '../api/get-conversation-messages';
import { useUpdateMessage } from '../api/update-message';
import { useGraphChatSettingsStore } from '../stores/graph-chat-settings-store';
import { ReactFlowEdge } from '../types/edge';
import { HandleId } from '../types/handle';
import { Message } from '../types/message';
import { createTemporaryEdge, messageEdgeToReactFlowEdge } from '../util/edge';
import { createSourceHandleId, createTargetHandleId, oppositeHandleSide } from '../util/handle';
import { getLayoutedElements } from '../util/layout';
import {
  branchedNodeCoordinates,
  generateTempNodeId,
  messageToNode,
  newPromptCoordinates,
} from '../util/node';
import GraphControls from './graph-controls';

const POSITION_UPDATE_INTERVAL = 2500; // Interval to send message position updates

const nodeTypes = { prompt: PromptNode, response: ResponseNode };

type GraphChatProps = {
  conversationId?: number | undefined;
};

const GraphChat: React.FC<GraphChatProps> = ({ conversationId: _conversationId }) => {
  const { settings } = useGraphChatSettingsStore();
  const [conversationId, setConversationId] = useState(_conversationId);
  const [edges, setEdges] = useState<ReactFlowEdge[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const { isLoggedIn } = useAuthStore();

  const queryClient = useQueryClient();
  const pendingMessagePositionUpdatesRef = useRef<Record<string, NodePositionChange>>({});

  const { data: messageEdges, isFetched: edgesAreFetched } = useGetConversationEdges(
    conversationId || 0,
    {
      enabled: !!conversationId && isLoggedIn,
    }
  );

  const { data: messages, isFetched: messagesAreFetched } = useGetConversationMessages(
    conversationId || 0,
    {
      enabled: !!conversationId && isLoggedIn,
    }
  );

  const updateMessage = useUpdateMessage(conversationId || 0);

  const createPrompt = useCreatePrompt(conversationId || 0, {
    onSettled: (data) => setConversationId(data?.conversationId || 0),
  });

  const throttledMessagePositionUpdate = useRef(
    throttle(
      () => {
        const updates = { ...pendingMessagePositionUpdatesRef.current };
        pendingMessagePositionUpdatesRef.current = {};
        Object.entries(updates).forEach(([id, { position }]) => {
          if (!position) return;
          updateMessage.mutate({
            id: parseInt(id),
            xCoordinate: position.x,
            yCoordinate: position.y,
          });
        });
      },
      POSITION_UPDATE_INTERVAL,
      { leading: false, trailing: true }
    )
  ).current;

  const persistentMessageIds = useMemo(() => {
    return new Set(messages?.map((msg) => msg.id.toString()) || []);
  }, [messages]);

  const hasLoadedInitialGraph = useMemo(
    () =>
      messagesAreFetched &&
      edgesAreFetched &&
      messageEdges &&
      messages &&
      nodes.length === 0 &&
      edges.length === 0,
    [messagesAreFetched, edgesAreFetched, messageEdges, messages, nodes, edges]
  );

  useEffect(() => {
    if (hasLoadedInitialGraph) {
      console.log({ messages, messageEdges });
      setNodes([]);
      setEdges([]);
      setNodes((nds) =>
        applyNodeChanges(
          messages!.map((msg) => ({
            type: 'add',
            item: messageToNode(msg),
          })),
          nds
        )
      );
      setEdges((eds) =>
        applyEdgeChanges(
          messageEdges!.map((edge) => ({
            type: 'add',
            item: messageEdgeToReactFlowEdge(edge),
          })),
          eds
        )
      );
    }
  }, [hasLoadedInitialGraph, messages, messageEdges]);

  // Update all edges when edge type setting changes
  useEffect(() => {
    if (edges.length > 0) {
      setEdges((currentEdges) =>
        currentEdges.map((edge) => ({
          ...edge,
          type: settings.edgeType === 'default' ? undefined : settings.edgeType,
        }))
      );
    }
  }, [settings.edgeType, setEdges, edges.length]);

  const handleNodeUpdates = useCallback(
    (changes: NodePositionChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      const persistentChanges = changes.filter((change) => persistentMessageIds.has(change.id));

      // Optimisticlly update the position of messages that have been moved
      queryClient.setQueryData<Message[]>(
        createConversationMessagesQueryKey(conversationId),
        (prevNodes) => {
          if (!prevNodes) return [];
          const updateMap = Object.fromEntries(persistentChanges.map((n) => [n.id, n.position]));
          return prevNodes.map((node) =>
            updateMap[node.id] ? { ...node, position: updateMap[node.id] } : node
          );
        }
      );

      // Update the latest position of each message. This will be used in the next update batch
      persistentChanges.forEach((node) => {
        pendingMessagePositionUpdatesRef.current[node.id] = node;
      });

      if (isLoggedIn) throttledMessagePositionUpdate();
    },
    [queryClient, throttledMessagePositionUpdate, conversationId, persistentMessageIds]
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

      // Destination node must be a prompt node that is editable (still unsent/temporary)
      const destinationNode = nodes.find(
        (node) => node.id === connection.target && node.type === 'prompt' && node.data.isEditable
      );

      if (sourceNode && destinationNode) {
        // If the connection is valid, add the edge
        setEdges((eds) =>
          addEdge(
            createTemporaryEdge(
              connection.source,
              connection.target,
              connection.sourceHandle! as HandleId,
              connection.targetHandle! as HandleId
            ),
            eds
          )
        );
      }
    },
    [nodes, setEdges]
  );

  const { getNode } = useReactFlow();

  const onBranchResponse: OnBranchResponse = useCallback(
    ({ id, handleSide }) => {
      const node = getNode(id); // Get the node being branched from
      if (!node) return;

      const oppositeSide = oppositeHandleSide(handleSide);
      const tempNodeId = generateTempNodeId(); // Used until the prompt is created

      // Create temporary node for prompt (will be replaced with actual prompt node on creation)
      setNodes((nds) =>
        applyNodeChanges(
          [
            {
              type: 'add',
              item: {
                id: tempNodeId,
                position: branchedNodeCoordinates(node, handleSide),
                data: {
                  isEditable: true,
                  isLoading: false,
                },
                type: 'prompt',
                draggable: true,
              },
            },
          ],
          nds
        )
      );

      // Create temporary edge to prompt node (will be replaced with actual response-prompt edge on creation)
      setEdges((eds) =>
        addEdge(
          createTemporaryEdge(
            node.id,
            tempNodeId,
            createSourceHandleId(handleSide),
            createTargetHandleId(oppositeSide)
          ),
          eds
        )
      );
    },
    [setEdges, setNodes, getNode] // Get the node being branched from
  );

  const onSendPrompt: OnSendPrompt = useCallback(
    ({ id, content, position }) => {
      const node = nodes.find((n) => n.id === id); // Find temporary node of the prompt being sent
      if (!node) return;

      const branchSide = position;
      const responseCoordinates = branchedNodeCoordinates(node, branchSide);

      createPrompt.mutate(
        {
          content,
          xCoordinate: node.position.x,
          yCoordinate: node.position.y,
          targetHandle: createTargetHandleId(oppositeHandleSide(branchSide)),
          responseXCoordinate: responseCoordinates.x,
          responseYCoordinate: responseCoordinates.y,
          sourceHandle: createSourceHandleId(branchSide),
          conversationId,
          sources: edges
            .filter((edge) => edge.target === node.id)
            .map((edge) => ({
              sourceMessageId: parseInt(edge.source),
              sourceHandle: edge.sourceHandle,
              targetHandle: edge.targetHandle,
            })),
        },
        {
          onSettled: (data, _, variables) => {
            if (data) {
              setConversationId(data.conversationId); // Conversation ID is created on the first prompt
              setNodes((nds) =>
                applyNodeChanges(
                  [
                    {
                      type: 'add', // Add the new response node
                      item: {
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
                    },
                    {
                      type: 'replace', // Replace the temporary prompt node with the created prompt node
                      id: node.id,
                      item: {
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
                    },
                  ],
                  nds
                )
              );

              setEdges((eds) =>
                applyEdgeChanges(
                  [
                    // Add the new edges
                    ...data.createdEdges.map(
                      (edge): EdgeAddChange<ReactFlowEdge> => ({
                        type: 'add',
                        item: messageEdgeToReactFlowEdge(edge),
                      })
                    ),
                    // Remove the temporary edges to the prompt node
                    ...edges
                      .filter((e) => e.target === node.id)
                      .map(
                        ({ id }): EdgeRemoveChange => ({
                          type: 'remove',
                          id,
                        })
                      ),
                  ],
                  eds
                )
              );
            }
          },
          onError: (error) => {
            console.error('Error creating prompt:', error);
            // Reset the prompt node to non-loading state when an error occurs. Allows user to try resending
            setNodes((nds) =>
              applyNodeChanges(
                [
                  {
                    id: node.id,
                    type: 'replace',
                    item: { ...node, data: { ...node.data, isLoading: false } },
                  },
                ],
                nds
              )
            );
          },
        }
      );

      // Set the prompt node to loading state on send
      setNodes((nds) =>
        applyNodeChanges(
          [
            {
              id: node.id,
              type: 'replace',
              item: { ...node, data: { ...node.data, isLoading: true } },
            },
          ],
          nds
        )
      );
    },
    [nodes, createPrompt, edges, setEdges, conversationId]
  );

  const handleCreateNewPrompt = useCallback(() => {
    const promptCoordinates = newPromptCoordinates(nodes);
    setNodes((nds) =>
      nds.concat({
        id: `${Date.now()}`,
        position: promptCoordinates,
        data: {
          isEditable: true,
          isLoading: false,
        },
        type: 'prompt',
        draggable: true,
      })
    );
  }, [setNodes, nodes]);

  // Function to trigger auto-layout
  const handleAutoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);

    // Create NodePositionChange[] for position updates
    const positionChanges = layoutedNodes.reduce<NodePositionChange[]>((acc, layoutedNode) => {
      const originalNode = nodes.find((n) => n.id === layoutedNode.id);
      if (!originalNode) return acc;
      if (
        originalNode.position.x !== layoutedNode.position.x ||
        originalNode.position.y !== layoutedNode.position.y
      ) {
        acc.push({
          id: layoutedNode.id,
          type: 'position',
          position: layoutedNode.position,
        });
      }
      return acc;
    }, []);

    if (positionChanges.length > 0) {
      handleNodeUpdates(positionChanges);
    }
    setEdges(layoutedEdges);
  }, [nodes, edges, setEdges, handleNodeUpdates]);

  return (
    <GraphProvider
      onBranchResponse={onBranchResponse}
      onSendPrompt={onSendPrompt}
      onAutoLayout={handleAutoLayout}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
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
          onClick={handleCreateNewPrompt}
        >
          New Prompt
        </Button>
      </ReactFlow>
    </GraphProvider>
  );
};

export { GraphChat };
