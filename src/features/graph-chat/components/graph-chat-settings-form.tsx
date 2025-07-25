'use client';

import { NEW_PROMPT_LOCATION_STRATEGY } from '../util/node';

import { Button } from '@/components/ui/button/button';
import { Checkbox } from '@/components/ui/checkbox/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form/form';
import { Input } from '@/components/ui/input/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/select';
import { Separator } from '@/components/ui/separator/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  GraphChatSettingsSchema,
  useSaveGraphChatSettings,
  type DagreAlignment,
  type DagreRanker,
  type EdgeType,
  type GraphChatSettings,
  type LayoutDirection,
} from '../hooks/save-graph-chat-settings';
import { useGraphChatSettingsStore } from '../stores/graph-chat-settings-store';

const promptLocationStrategyLabels: Record<NEW_PROMPT_LOCATION_STRATEGY, string> = {
  [NEW_PROMPT_LOCATION_STRATEGY.CENTER]: 'Center',
  [NEW_PROMPT_LOCATION_STRATEGY.TOP]: 'Top',
  [NEW_PROMPT_LOCATION_STRATEGY.RIGHT]: 'Right',
  [NEW_PROMPT_LOCATION_STRATEGY.LEFT]: 'Left',
  [NEW_PROMPT_LOCATION_STRATEGY.BOTTOM]: 'Bottom',
};

const sideLabels = {
  top: 'Top',
  right: 'Right',
  bottom: 'Bottom',
  left: 'Left',
} as const;

const edgeTypeLabels: Record<EdgeType, string> = {
  default: 'Default',
  bezier: 'Bezier',
  smoothstep: 'Smooth Step',
  step: 'Step',
  straight: 'Straight',
} as const;

const layoutDirectionLabels: Record<LayoutDirection, string> = {
  TB: 'Top to Bottom',
  BT: 'Bottom to Top',
  LR: 'Left to Right',
  RL: 'Right to Left',
} as const;

const dagreRankerLabels: Record<DagreRanker, string> = {
  'network-simplex': 'Network Simplex',
  'tight-tree': 'Tight Tree',
  'longest-path': 'Longest Path',
} as const;

const dagreAlignmentLabels: Record<NonNullable<DagreAlignment>, string> = {
  UL: 'Upper Left',
  UR: 'Upper Right',
  DL: 'Down Left',
  DR: 'Down Right',
} as const;

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  description,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between space-x-2 rounded-lg p-2 hover:bg-muted/50 transition-colors [&[data-state=open]>svg]:rotate-180">
        <div className="text-left">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-300" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-4">
        <div className="space-y-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function GraphChatSettingsForm({
  onSubmit: onSubmitCallback,
}: { onSubmit?: () => void } = {}) {
  const { settings } = useGraphChatSettingsStore();
  const saveSettings = useSaveGraphChatSettings();

  // Ensure all numerical fields have default values - memoize to prevent infinite rerenders
  const formDefaults = useMemo(
    () => ({
      ...settings,
      layout: {
        direction: settings.layout?.direction || 'TB',
        ranksep: settings.layout?.ranksep || 200,
        nodesep: settings.layout?.nodesep || 150,
        edgesep: settings.layout?.edgesep || 50,
        marginx: settings.layout?.marginx || 100,
        marginy: settings.layout?.marginy || 100,
        ranker: settings.layout?.ranker || 'tight-tree',
        align: settings.layout?.align,
      },
      newPromptLocationStrategy:
        settings.newPromptLocationStrategy || NEW_PROMPT_LOCATION_STRATEGY.CENTER,
    }),
    [settings]
  );

  const form = useForm<GraphChatSettings>({
    resolver: zodResolver(GraphChatSettingsSchema),
    defaultValues: formDefaults,
  });

  const onSubmit = (data: GraphChatSettings) => {
    console.log('Form submission data:', data);
    try {
      saveSettings(data);
      onSubmitCallback?.();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onError = (errors: any) => {
    console.error('Form validation errors:', errors);
  };

  return (
    <Form {...form}>
      <form onSubmit={() => form.handleSubmit(onSubmit, onError)} className="space-y-6">
        {/* New Prompt Placement Strategy */}
        <CollapsibleSection
          title="Prompt Placement Strategy"
          description="Choose where new prompt nodes are placed by default."
          defaultOpen={true}
        >
          <FormField
            control={form.control}
            name="newPromptLocationStrategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Prompt Placement</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select placement strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(promptLocationStrategyLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </CollapsibleSection>

        <Separator />

        {/* Node Connection Settings */}
        <CollapsibleSection
          title="Node Connection Settings"
          description="Configure connection points for prompt and response nodes."
          defaultOpen={true}
        >
          {/* Prompt Node Settings */}
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-semibold">Prompt Node Settings</h4>
              <p className="text-sm text-muted-foreground">
                Configure connection points for prompt nodes.
              </p>
            </div>

            {/* Prompt Incoming Sides */}
            <div className="space-y-3">
              <div>
                <h5 className="text-sm font-medium">Incoming Edge Sides</h5>
                <p className="text-xs text-muted-foreground">
                  Select which sides of prompt nodes can receive incoming connections.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(Object.entries(sideLabels) as Array<[keyof typeof sideLabels, string]>).map(
                  ([side, label]) => (
                    <FormField
                      key={`prompt-incoming-${side}`}
                      control={form.control}
                      name={`prompt.incomingSides.${side}`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">{label}</FormLabel>
                        </FormItem>
                      )}
                    />
                  )
                )}
              </div>
            </div>

            {/* Prompt Outgoing Sides */}
            <div className="space-y-3">
              <div>
                <h5 className="text-sm font-medium">Outgoing Edge Sides</h5>
                <p className="text-xs text-muted-foreground">
                  Select which sides of prompt nodes can send outgoing connections.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(Object.entries(sideLabels) as Array<[keyof typeof sideLabels, string]>).map(
                  ([side, label]) => (
                    <FormField
                      key={`prompt-outgoing-${side}`}
                      control={form.control}
                      name={`prompt.outgoingSides.${side}`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">{label}</FormLabel>
                        </FormItem>
                      )}
                    />
                  )
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Response Node Settings */}
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-semibold">Response Node Settings</h4>
              <p className="text-sm text-muted-foreground">
                Configure connection points for response nodes.
              </p>
            </div>

            {/* Response Incoming Sides */}
            <div className="space-y-3">
              <div>
                <h5 className="text-sm font-medium">Incoming Edge Sides</h5>
                <p className="text-xs text-muted-foreground">
                  Select which sides of response nodes can receive incoming connections.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(Object.entries(sideLabels) as Array<[keyof typeof sideLabels, string]>).map(
                  ([side, label]) => (
                    <FormField
                      key={`response-incoming-${side}`}
                      control={form.control}
                      name={`response.incomingSides.${side}`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">{label}</FormLabel>
                        </FormItem>
                      )}
                    />
                  )
                )}
              </div>
            </div>

            {/* Response Outgoing Sides */}
            <div className="space-y-3">
              <div>
                <h5 className="text-sm font-medium">Outgoing Edge Sides</h5>
                <p className="text-xs text-muted-foreground">
                  Select which sides of response nodes can send outgoing connections.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(Object.entries(sideLabels) as Array<[keyof typeof sideLabels, string]>).map(
                  ([side, label]) => (
                    <FormField
                      key={`response-outgoing-${side}`}
                      control={form.control}
                      name={`response.outgoingSides.${side}`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">{label}</FormLabel>
                        </FormItem>
                      )}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <Separator />

        {/* Layout Settings */}
        <CollapsibleSection
          title="Layout Settings"
          description="Configure the Dagre layout algorithm settings."
          defaultOpen={false}
        >
          <div className="space-y-4">
            {/* Layout Direction */}
            <FormField
              control={form.control}
              name="layout.direction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Layout Direction</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select layout direction" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(layoutDirectionLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Rank Separation */}
            <FormField
              control={form.control}
              name="layout.ranksep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rank Separation (50-500px)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={50}
                      max={500}
                      value={field.value?.toString() || '200'}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(isNaN(value) ? 200 : value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Node Separation */}
            <FormField
              control={form.control}
              name="layout.nodesep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Node Separation (50-300px)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={50}
                      max={300}
                      value={field.value?.toString() || '150'}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(isNaN(value) ? 150 : value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Edge Separation */}
            <FormField
              control={form.control}
              name="layout.edgesep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Edge Separation (10-200px)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={10}
                      max={200}
                      value={field.value?.toString() || '50'}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(isNaN(value) ? 50 : value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Margin X */}
            <FormField
              control={form.control}
              name="layout.marginx"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horizontal Margin (0-200px)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={200}
                      value={field.value?.toString() || '100'}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(isNaN(value) ? 100 : value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Margin Y */}
            <FormField
              control={form.control}
              name="layout.marginy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vertical Margin (0-200px)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={200}
                      value={field.value?.toString() || '100'}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(isNaN(value) ? 100 : value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ranker Algorithm */}
            <FormField
              control={form.control}
              name="layout.ranker"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ranking Algorithm</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ranking algorithm" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(dagreRankerLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Alignment */}
            <FormField
              control={form.control}
              name="layout.align"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Node Alignment (Optional)</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || 'auto'}
                      onValueChange={(value) =>
                        field.onChange(value === 'auto' ? undefined : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select alignment (none for auto)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (No alignment)</SelectItem>
                        {Object.entries(dagreAlignmentLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </CollapsibleSection>

        <Separator />

        {/* Edge Type Settings */}
        <CollapsibleSection
          title="Edge Type Settings"
          description="Select the type of edges to use for connections between nodes."
          defaultOpen={false}
        >
          <FormField
            control={form.control}
            name="edgeType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Edge Type</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select edge type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(edgeTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </CollapsibleSection>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" className="w-full sm:w-auto">
            Save Settings
          </Button>
        </div>
      </form>
    </Form>
  );
}

export interface GraphChatSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function GraphChatSettingsModal({ open, onClose }: GraphChatSettingsModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[700px] w-full h-[80vh] max-h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Graph Chat Settings</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-2">
          <GraphChatSettingsForm onSubmit={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
