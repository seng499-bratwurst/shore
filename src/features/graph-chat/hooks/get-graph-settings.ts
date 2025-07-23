import { useGraphChatSettingsStore } from '../stores/graph-chat-settings-store';

export const useGraphChatSettings = () => {
  const { settings } = useGraphChatSettingsStore();
  return settings;
};
