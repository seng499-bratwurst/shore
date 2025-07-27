import { Textarea } from '@/components/ui/textarea/textarea';
import { type Node, type NodeProps } from '@xyflow/react';
import React from 'react';
import { FiSend } from 'react-icons/fi';
import { useGraphContext } from '../contexts/graph-provider';
import { useGraphChatSettingsStore } from '../stores/graph-chat-settings-store';
import { HandleSide } from '../types/handle';
import { BaseNodeActions } from './node-edge-controls';
import { NodeHandles } from './node-handles';

const PromptSendControls: React.FC<{
  onSendPrompt: (position: HandleSide) => void;
  isLoading: boolean;
}> = ({ onSendPrompt, isLoading }) => {
  const { settings } = useGraphChatSettingsStore();

  return (
    <BaseNodeActions
      onAction={onSendPrompt}
      enabledSides={settings.prompt.outgoingSides}
      isDisabled={isLoading}
      icon={FiSend}
      buttonVariant="default"
    />
  );
};

type PromptNodeType = Node<{ isLoading?: boolean; isEditable?: boolean; content?: string }>;

const PromptNode: React.FC<NodeProps<PromptNodeType>> = (props) => {
  const [prompt, setPrompt] = React.useState<string>('');
  const { settings } = useGraphChatSettingsStore();

  const { onSendPrompt: _onSendPrompt } = useGraphContext();

  const onSendPrompt = (position: HandleSide) => {
    if (props.data.isEditable && prompt.trim() !== '') {
      _onSendPrompt({
        content: prompt,
        id: props.id,
        position,
      });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent new line on Enter key press and send prompt instead
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      _onSendPrompt({
        content: prompt,
        id: props.id,
        position: 'right',
      });
    }
  };

  return (
    <div className="relative bg-card rounded-b-lg shadow-md flex flex-col min-w-[250px] max-w-[300px] min-h-[100px]">
      <NodeHandles settings={settings.prompt} />
      <div className="bg-primary text-primary-foreground w-full text-sm px-sm py-xs">Prompt</div>
      <div className="bg-card p-xs pointer-events-auto">
        {props.data.isEditable ? (
          <Textarea
            className="flex-1 px-sm py-2xs text-sm !bg-card border-none focus:ring-0 resize-none"
            placeholder="Type your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={props.data.isLoading}
          />
        ) : (
          <div className="select-text px-sm py-2xs text-sm pointer-events-auto">
            {props.data.content}
          </div>
        )}
      </div>
      {props.data.isEditable && prompt.length > 0 && (
        <PromptSendControls onSendPrompt={onSendPrompt} isLoading={!!props.data.isLoading} />
      )}
    </div>
  );
};

export { BaseNodeActions, PromptNode };
