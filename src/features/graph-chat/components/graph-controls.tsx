import { Button } from '@/components/ui/button/button';
import { useSidebar } from '@/components/ui/sidebar/sidebar';
import { useReactFlow } from '@xyflow/react';
import { useState } from 'react';
import { FiMaximize, FiMinusCircle, FiPlusCircle, FiSettings, FiSidebar } from 'react-icons/fi';
import { GraphChatSettingsModal } from './graph-chat-settings-form';

export default function GraphControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const sidebar = useSidebar();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="absolute left-2.5 top-1/2 z-10 -translate-y-1/2 grid grid-cols-1 gap-2 items-center mt-[-32px]">
        <Button onClick={() => zoomIn()} aria-label="Zoom in" variant="ghost" size="icon">
          <FiPlusCircle size={20} />
        </Button>
        <Button onClick={() => zoomOut()} aria-label="Zoom out" variant="ghost" size="icon">
          <FiMinusCircle size={20} />
        </Button>
        <Button onClick={() => fitView()} aria-label="Fit view" variant="ghost" size="icon">
          <FiMaximize size={20} />
        </Button>
        <Button
          onClick={sidebar.toggleSidebar}
          aria-label="Toggle sidebar"
          variant="ghost"
          size="icon"
        >
          <FiSidebar size={20} />
        </Button>
        <Button
          onClick={() => setSettingsOpen(true)}
          aria-label="Graph settings"
          variant="ghost"
          size="icon"
        >
          <FiSettings size={20} />
        </Button>
      </div>

      <GraphChatSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
