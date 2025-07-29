import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GraphChatSettings } from '../hooks/save-graph-chat-settings';

import { NEW_PROMPT_LOCATION_STRATEGY } from '../util/node';

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
        layout: {
          direction: 'TB',
          ranksep: 200,
          nodesep: 150,
          edgesep: 50,
          marginx: 100,
          marginy: 100,
          ranker: 'tight-tree',
          align: undefined,
        },
        newPromptLocationStrategy: NEW_PROMPT_LOCATION_STRATEGY.CENTER,
      },
      setSettings: (settings) => set({ settings }),
    }),
    {
      name: 'graph-chat-settings-storage',
    }
  )
);
