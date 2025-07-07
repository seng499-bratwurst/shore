import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GraphChatSettings } from '../hooks/save-graph-chat-settings';

type GraphChatSettingsStore = {
  settings: GraphChatSettings;
  setSettings: (settings: GraphChatSettings) => void;
};

export const useGraphChatSettingsStore = create<GraphChatSettingsStore>()(
  persist(
    (set) => ({
      settings: {
        prompt: {
          incomingSides: { left: true, right: true, top: true, bottom: true },
          outgoingSides: { left: true, right: true, top: true, bottom: true },
        },
        response: {
          incomingSides: { left: true, right: true, top: true, bottom: true },
          outgoingSides: { left: true, right: true, top: true, bottom: true },
        },
        edgeType: 'default',
      },
      setSettings: (settings) => set({ settings }),
    }),
    {
      name: 'graph-chat-settings-storage',
    }
  )
);
