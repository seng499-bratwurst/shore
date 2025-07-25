import { Button } from '@/components/ui/button/button';
import { useSidebar } from '@/components/ui/sidebar/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip/tooltip';
import { useReactFlow } from '@xyflow/react';
import { useState } from 'react';
import { FiMaximize, FiMinusCircle, FiPlusCircle, FiSettings, FiSidebar } from 'react-icons/fi';
import { PiGraph } from 'react-icons/pi';
import { useGraphContext } from '../contexts/graph-provider';
import { GraphChatSettingsModal } from './graph-chat-settings-form';

export default function GraphControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const sidebar = useSidebar();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { onAutoLayout } = useGraphContext();

  return (
    <>
      <div className="absolute left-2.5 top-1/2 z-10 -translate-y-1/2 grid grid-cols-1 gap-2 items-center mt-[-32px]">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => zoomIn()} aria-label="Zoom in" variant="ghost" size="icon">
              <FiPlusCircle size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Zoom in</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => zoomOut()} aria-label="Zoom out" variant="ghost" size="icon">
              <FiMinusCircle size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Zoom out</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => fitView()} aria-label="Fit view" variant="ghost" size="icon">
              <FiMaximize size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Fit view</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onAutoLayout} aria-label="Auto layout" variant="ghost" size="icon">
              <PiGraph size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Auto layout</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={sidebar.toggleSidebar}
              aria-label="Toggle sidebar"
              variant="ghost"
              size="icon"
            >
              <FiSidebar size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Toggle sidebar</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setSettingsOpen(true)}
              aria-label="Graph settings"
              variant="ghost"
              size="icon"
            >
              <FiSettings size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Graph settings</TooltipContent>
        </Tooltip>
      </div>

      <GraphChatSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
