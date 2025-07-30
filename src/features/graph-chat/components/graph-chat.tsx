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
  NodeReplaceChange,
  OnConnect,
  OnNodesChange,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { throttle } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCreatePrompt } from '../api/create-prompt';
import { useCreatePromptStreaming } from '../api/create-prompt-streaming';
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
const USE_STREAMING = true; // Feature flag for streaming - ENABLED now that backend is verified

// Helper function to check if an edge has valid message IDs (handles both capitalized and lowercase field names)
const isValidEdge = (edge: {
  sourceMessageId?: number | string;
  SourceMessageId?: number | string;
  targetMessageId?: number | string;
  TargetMessageId?: number | string;
}) => {
  const sourceId = edge.sourceMessageId || edge.SourceMessageId;
  const targetId = edge.targetMessageId || edge.TargetMessageId;
  return sourceId && targetId;
};

const nodeTypes = { prompt: PromptNode, response: ResponseNode };

type GraphChatProps = {
  conversationId?: number | undefined;
};

const GraphChat: React.FC<GraphChatProps> = ({ conversationId: _conversationId }) => {
  const { settings } = useGraphChatSettingsStore();
  const [conversationId, setConversationId] = useState(_conversationId);
  const [edges, setEdges] = useState<ReactFlowEdge[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isPromptSending, setIsPromptSending] = useState(false);
  const [, setStreamingResponseId] = useState<string | null>(null);
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

  const createPromptStreaming = useCreatePromptStreaming(conversationId || 0);

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
    [queryClient, throttledMessagePositionUpdate, conversationId, persistentMessageIds, isLoggedIn]
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
                  isLoading: isPromptSending,
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
    [setEdges, setNodes, getNode, isPromptSending] // Get the node being branched from
  );

  const onSendPrompt: OnSendPrompt = useCallback(
    ({ id, content, position }) => {
      // Allow only one prompt to be submitted at a time
      if (isPromptSending) return;
      setIsPromptSending(true);

      // Set all nodes to the loading state
      setNodes((nds) =>
        applyNodeChanges(
          nds.map<NodeReplaceChange>((node) => ({
            id: node.id,
            type: 'replace',
            item: { ...node, data: { ...node.data, isLoading: true } },
          })),
          nds
        )
      );

      const node = nodes.find((n) => n.id === id); // Find temporary node of the prompt being sent
      if (!node) return;

      const branchSide = position;
      const responseCoordinates = branchedNodeCoordinates(node, branchSide);

      const promptRequest = {
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
      };

      if (USE_STREAMING) {
        // Generate a temporary response node ID for streaming
        const tempResponseId = `temp-response-${Date.now()}`;
        setStreamingResponseId(tempResponseId);

        // Immediately add a streaming response node
        setNodes((nds) =>
          applyNodeChanges(
            [
              {
                type: 'add',
                item: {
                  id: tempResponseId,
                  position: responseCoordinates,
                  data: {
                    content: '',
                    isStreaming: true,
                    streamingContent: '',
                    oncApiQuery: '',
                    oncApiResponse: '',
                  },
                  type: 'response',
                  draggable: true,
                },
              },
            ],
            nds
          )
        );

        // Immediately add a temporary edge from prompt to response
        setEdges((eds) =>
          addEdge(
            createTemporaryEdge(
              node.id,
              tempResponseId,
              createSourceHandleId(branchSide),
              createTargetHandleId(oppositeHandleSide(branchSide))
            ),
            eds
          )
        );

        createPromptStreaming.mutate(
          {
            ...promptRequest,
            callbacks: {
              onChunk: (chunk: string) => {
                // Update the streaming response node in real-time
                setNodes((nds) =>
                  applyNodeChanges(
                    nds.map<NodeReplaceChange>((n) => {
                      if (n.id === tempResponseId && n.type === 'response') {
                        const currentContent = n.data.streamingContent || '';
                        return {
                          id: n.id,
                          type: 'replace',
                          item: {
                            ...n,
                            data: {
                              ...n.data,
                              isStreaming: true,
                              streamingContent: currentContent + chunk,
                            },
                          },
                        };
                      }
                      return {
                        id: n.id,
                        type: 'replace',
                        item: n,
                      };
                    }),
                    nds
                  )
                );
              },
              onComplete: (response) => {
                // Update the response node with final content and remove streaming state
                setNodes((nds) =>
                  applyNodeChanges(
                    nds.map<NodeReplaceChange>((n) => {
                      if (n.id === tempResponseId && n.type === 'response') {
                        return {
                          id: n.id,
                          type: 'replace',
                          item: {
                            ...n,
                            data: {
                              ...n.data,
                              content: response.response,
                              documents: response.documents || [],
                              isStreaming: false,
                              streamingContent: undefined,
                            },
                          },
                        };
                      }
                      return {
                        id: n.id,
                        type: 'replace',
                        item: n,
                      };
                    }),
                    nds
                  )
                );
              },
              onError: (error: string) => {
                console.error('Streaming error:', error);
                setStreamingResponseId(null);
              },
            },
          },
          {
            onSettled: (data, _, variables) => {
              if (data) {
                setConversationId(data.conversationId);
                // Replace the temporary response node with the actual response node
                setNodes((nds) =>
                  applyNodeChanges(
                    [
                      {
                        type: 'replace', // Replace the temp response node
                        id: tempResponseId,
                        item: {
                          id: data.responseMessageId.toString(),
                          position: {
                            x: variables.responseXCoordinate,
                            y: variables.responseYCoordinate,
                          },
                          data: {
                            content: data.response,
                            isStreaming: false,
                            documents: data.documents || [],
                            oncApiQuery: '',
                            oncApiResponse: '',
                          },
                          type: 'response',
                          draggable: true,
                        },
                      },
                      {
                        type: 'replace', // Replace the temporary prompt node
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
                      // Remove the temporary edge from temp prompt to temp response
                      {
                        type: 'remove',
                        id: `${node.id}-${tempResponseId}`,
                      },
                      // Filter out any invalid edges before processing
                      ...data.createdEdges
                        .filter(isValidEdge)
                        .map((edge): EdgeAddChange<ReactFlowEdge> => {
                          // Use handles from the original request if backend doesn't provide them
                          const edgeWithHandles = {
                            ...edge,
                            sourceHandle: edge.sourceHandle || variables.sourceHandle,
                            targetHandle: edge.targetHandle || variables.targetHandle,
                          };
                          return {
                            type: 'add',
                            item: messageEdgeToReactFlowEdge(edgeWithHandles),
                          };
                        }),
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
              setNodes((nds) =>
                applyNodeChanges(
                  nds.map<NodeReplaceChange>((n) => ({
                    id: n.id,
                    type: 'replace',
                    item: { ...n, data: { ...n.data, isLoading: false } },
                  })),
                  nds
                )
              );
              setIsPromptSending(false);
            },
            onError: (error) => {
              console.error('Error creating prompt with streaming:', error);

              // Fallback to regular API if streaming fails
              createPrompt.mutate(promptRequest, {
                onSettled: (data, _, variables) => {
                  if (data) {
                    setConversationId(data.conversationId);
                    // Remove the temporary streaming response node and add the actual response
                    setNodes((nds) =>
                      applyNodeChanges(
                        [
                          {
                            type: 'remove',
                            id: tempResponseId,
                          },
                          {
                            type: 'add',
                            item: {
                              id: data.responseMessageId.toString(),
                              position: {
                                x: variables.responseXCoordinate,
                                y: variables.responseYCoordinate,
                              },
                              data: {
                                content: data.response,
                                documents: data.documents || [],
                                oncApiQuery: '',
                                oncApiResponse: '',
                              },
                              type: 'response',
                              draggable: true,
                            },
                          },
                          {
                            type: 'replace',
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
                          // Filter out any invalid edges before processing
                          ...data.createdEdges
                            .filter(isValidEdge)
                            .map((edge): EdgeAddChange<ReactFlowEdge> => {
                              // Use handles from the original request if backend doesn't provide them
                              const edgeWithHandles = {
                                ...edge,
                                sourceHandle: edge.sourceHandle || variables.sourceHandle,
                                targetHandle: edge.targetHandle || variables.targetHandle,
                              };
                              return {
                                type: 'add',
                                item: messageEdgeToReactFlowEdge(edgeWithHandles),
                              };
                            }),
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
                  setNodes((nds) =>
                    applyNodeChanges(
                      nds.map<NodeReplaceChange>((n) => ({
                        id: n.id,
                        type: 'replace',
                        item: { ...n, data: { ...n.data, isLoading: false } },
                      })),
                      nds
                    )
                  );
                  setIsPromptSending(false);
                },
                onError: (fallbackError) => {
                  console.error('Fallback API also failed:', fallbackError);
                  setNodes((nds) =>
                    applyNodeChanges(
                      nds.map<NodeReplaceChange>((n) => ({
                        id: n.id,
                        type: 'replace',
                        item: { ...n, data: { ...n.data, isLoading: false } },
                      })),
                      nds
                    )
                  );
                  setIsPromptSending(false);
                  setStreamingResponseId(null);
                },
              });
            },
          }
        );
      } else {
        // Non-streaming fallback (original logic)
        createPrompt.mutate(promptRequest, {
          onSettled: (data, _, variables) => {
            if (data) {
              setConversationId(data.conversationId);
              setNodes((nds) =>
                applyNodeChanges(
                  [
                    {
                      type: 'add',
                      item: {
                        id: data.responseMessageId.toString(),
                        position: {
                          x: variables.responseXCoordinate,
                          y: variables.responseYCoordinate,
                        },
                        data: {
                          content: data.response,
                          documents: data.documents || [],
                          oncApiQuery: '',
                          oncApiResponse: '',
                        },
                        type: 'response',
                        draggable: true,
                      },
                    },
                    {
                      type: 'replace',
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
                          isLoading: true,
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
                    // Filter out any invalid edges before processing
                    ...data.createdEdges
                      .filter(isValidEdge)
                      .map((edge): EdgeAddChange<ReactFlowEdge> => {
                        // Use handles from the original request if backend doesn't provide them
                        const edgeWithHandles = {
                          ...edge,
                          sourceHandle: edge.sourceHandle || variables.sourceHandle,
                          targetHandle: edge.targetHandle || variables.targetHandle,
                        };
                        return {
                          type: 'add',
                          item: messageEdgeToReactFlowEdge(edgeWithHandles),
                        };
                      }),
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
            setNodes((nds) =>
              applyNodeChanges(
                nds.map<NodeReplaceChange>((n) => ({
                  id: n.id,
                  type: 'replace',
                  item: { ...n, data: { ...n.data, isLoading: false } },
                })),
                nds
              )
            );
            setIsPromptSending(false);
          },
          onError: (error) => {
            console.error('Error creating prompt:', error);
            setNodes((nds) =>
              applyNodeChanges(
                nds.map<NodeReplaceChange>((n) => ({
                  id: n.id,
                  type: 'replace',
                  item: { ...n, data: { ...n.data, isLoading: false } },
                })),
                nds
              )
            );
          },
        });
      }
    },
    [
      nodes,
      createPrompt,
      createPromptStreaming,
      edges,
      setEdges,
      conversationId,
      isPromptSending,
      setNodes,
    ]
  );

  const handleCreateNewPrompt = useCallback(() => {
    const promptCoordinates = newPromptCoordinates(nodes);
    setNodes((nds) =>
      nds.concat({
        id: `${Date.now()}`,
        position: promptCoordinates,
        data: {
          isEditable: true,
          isLoading: isPromptSending,
        },
        type: 'prompt',
        draggable: true,
      })
    );
  }, [setNodes, nodes, isPromptSending]);

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
