import { Button } from '@/components/ui/button/button';
import { useReactFlow } from '@xyflow/react';
import { FiMaximize, FiMinusCircle, FiPlusCircle } from 'react-icons/fi';

export default function GraphControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute left-2.5 bottom-2.5 z-10 grid grid-cols-1">
      <Button onClick={() => zoomIn()} aria-label="Zoom in" variant="ghost" size="icon">
        <FiPlusCircle size={20} />
      </Button>
      <Button onClick={() => zoomOut()} aria-label="Zoom out" variant="ghost" size="icon">
        <FiMinusCircle size={20} />
      </Button>
      <Button onClick={() => fitView()} aria-label="Fit view" variant="ghost" size="icon">
        <FiMaximize size={20} />
      </Button>
    </div>
  );
}
