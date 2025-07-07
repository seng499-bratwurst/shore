import { z } from 'zod';
import { useGraphChatSettingsStore } from '../stores/graph-chat-settings-store';

// Define the available edge types from React Flow
export const EdgeTypeSchema = z.enum(['default', 'bezier', 'smoothstep', 'step', 'straight']);

// Create a schema for NodeSideSetting that maps each HandleSide to a boolean
export const NodeSideSettingSchema = z.object({
  top: z.boolean(),
  right: z.boolean(),
  bottom: z.boolean(),
  left: z.boolean(),
});

// Create the node-specific settings schema
export const NodeTypeSettingsSchema = z.object({
  incomingSides: NodeSideSettingSchema,
  outgoingSides: NodeSideSettingSchema,
});

// Create the main GraphChatSettings schema
export const GraphChatSettingsSchema = z.object({
  prompt: NodeTypeSettingsSchema,
  response: NodeTypeSettingsSchema,
  edgeType: EdgeTypeSchema,
});

export type GraphChatSettings = z.infer<typeof GraphChatSettingsSchema>;
export type NodeTypeSettings = z.infer<typeof NodeTypeSettingsSchema>;
export type NodeSideSetting = z.infer<typeof NodeSideSettingSchema>;
export type EdgeType = z.infer<typeof EdgeTypeSchema>;

export const useSaveGraphChatSettings = () => {
  const { setSettings } = useGraphChatSettingsStore();
  return (settings: GraphChatSettings) => {
    setSettings(settings);
  };
};
