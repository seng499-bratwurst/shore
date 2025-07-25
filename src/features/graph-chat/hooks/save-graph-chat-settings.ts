import { z } from 'zod';
import { useGraphChatSettingsStore } from '../stores/graph-chat-settings-store';

// Define the available edge types from React Flow
export const EdgeTypeSchema = z.enum(['default', 'bezier', 'smoothstep', 'step', 'straight']);

// Define the available layout directions
export const LayoutDirectionSchema = z.enum(['TB', 'BT', 'LR', 'RL']);

// Define the available dagre rankers
export const DagreRankerSchema = z.enum(['network-simplex', 'tight-tree', 'longest-path']);

// Define the available dagre alignments
export const DagreAlignmentSchema = z.enum(['UL', 'UR', 'DL', 'DR']).optional();

export const NewPromptGenerationStrategySchema = z.enum([
  'center',
  'left',
  'right',
  'top',
  'bottom',
]);

// Create a schema for Dagre layout settings
export const DagreLayoutSettingsSchema = z.object({
  direction: LayoutDirectionSchema,
  ranksep: z.number().min(50).max(500),
  nodesep: z.number().min(50).max(300),
  edgesep: z.number().min(10).max(200),
  marginx: z.number().min(0).max(200),
  marginy: z.number().min(0).max(200),
  ranker: DagreRankerSchema,
  align: DagreAlignmentSchema,
});

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
  layout: DagreLayoutSettingsSchema,
  newPromptLocationStrategy: NewPromptGenerationStrategySchema,
});

export type GraphChatSettings = z.infer<typeof GraphChatSettingsSchema>;
export type NodeTypeSettings = z.infer<typeof NodeTypeSettingsSchema>;
export type NodeSideSetting = z.infer<typeof NodeSideSettingSchema>;
export type EdgeType = z.infer<typeof EdgeTypeSchema>;
export type LayoutDirection = z.infer<typeof LayoutDirectionSchema>;
export type DagreRanker = z.infer<typeof DagreRankerSchema>;
export type DagreAlignment = z.infer<typeof DagreAlignmentSchema>;
export type DagreLayoutSettings = z.infer<typeof DagreLayoutSettingsSchema>;

export const useSaveGraphChatSettings = () => {
  const { setSettings } = useGraphChatSettingsStore();
  return (settings: GraphChatSettings) => {
    setSettings(settings);
  };
};
