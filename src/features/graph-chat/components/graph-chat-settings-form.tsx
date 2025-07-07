'use client';

import { Button } from '@/components/ui/button/button';
import { Checkbox } from '@/components/ui/checkbox/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form/form';
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
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  GraphChatSettingsSchema,
  useSaveGraphChatSettings,
  type EdgeType,
  type GraphChatSettings,
} from '../hooks/save-graph-chat-settings';
import { useGraphChatSettingsStore } from '../stores/graph-chat-settings-store';

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

  const form = useForm<GraphChatSettings>({
    resolver: zodResolver(GraphChatSettingsSchema),
    defaultValues: settings,
  });

  const onSubmit = (data: GraphChatSettings) => {
    saveSettings(data);
    onSubmitCallback?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          <Separator className="my-4" />

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
        <div className="flex-1 overflow-y-auto pr-2">
          <GraphChatSettingsForm onSubmit={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
