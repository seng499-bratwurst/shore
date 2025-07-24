import { Button } from '@/components/ui/button/button';
import { useSidebar } from '@/components/ui/sidebar/sidebar';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useReactFlow } from '@xyflow/react';
import { FiMaximize, FiMinusCircle, FiPlusCircle, FiSidebar } from 'react-icons/fi';

const SidebarToggleButton = () => {
  const sidebar = useSidebar();

  return (
    <Button onClick={sidebar.toggleSidebar} aria-label="Toggle sidebar" variant="ghost" size="icon">
      <FiSidebar size={20} />
    </Button>
  );
};

export default function GraphControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { isLoggedIn } = useAuthStore();

  return (
    <div className="absolute left-2.5 top-1/2 z-10 -translate-y-1/2 grid grid-cols-1 gap-2 items-center">
      <Button onClick={() => zoomIn()} aria-label="Zoom in" variant="ghost" size="icon">
        <FiPlusCircle size={20} />
      </Button>
      <Button onClick={() => zoomOut()} aria-label="Zoom out" variant="ghost" size="icon">
        <FiMinusCircle size={20} />
      </Button>
      <Button onClick={() => fitView()} aria-label="Fit view" variant="ghost" size="icon">
        <FiMaximize size={20} />
      </Button>
      {isLoggedIn && <SidebarToggleButton />}
    </div>
  );
}
