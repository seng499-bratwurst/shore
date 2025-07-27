import { Button } from '@/components/ui/button/button';
import React from 'react';
import { IconType } from 'react-icons';
import { FiSend } from 'react-icons/fi';
import { HandleSide } from '../types/handle';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

interface BaseNodeActionsProps {
  onAction: (position: HandleSide) => void;
  enabledSides: Partial<Record<HandleSide, boolean>>;
  isDisabled?: boolean;
  icon?: IconType;
  buttonVariant?: ButtonVariant;
}

export const BaseNodeActions: React.FC<BaseNodeActionsProps> = ({
  onAction,
  enabledSides,
  isDisabled = false,
  icon: Icon = FiSend,
  buttonVariant = 'default',
}) => {
  const [hoveredQuarter, setHoveredQuarter] = React.useState<HandleSide | null>(null);

  // Use the provided enabledSides directly
  const activeSides = enabledSides;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Get the parent container (the node) to calculate relative position
    const nodeRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!nodeRect) return;

    const nodeX = e.clientX - nodeRect.left;
    const nodeY = e.clientY - nodeRect.top;
    const centerX = nodeRect.width / 2;
    const centerY = nodeRect.height / 2;

    // Determine which quarter based on position relative to node center
    const relativeX = nodeX - centerX;
    const relativeY = nodeY - centerY;

    if (Math.abs(relativeX) > Math.abs(relativeY)) {
      // Horizontal quarters
      setHoveredQuarter(relativeX > 0 ? 'right' : 'left');
    } else {
      // Vertical quarters
      setHoveredQuarter(relativeY > 0 ? 'bottom' : 'top');
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    // Hide the controls when leaving any hover area
    setHoveredQuarter(null);
  };

  const getIconRotation = (side: HandleSide) => {
    switch (side) {
      case 'top':
        return 'rotate-[-90deg]';
      case 'right':
        return '';
      case 'bottom':
        return 'rotate-90';
      case 'left':
        return 'rotate-180';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Only create hover detection areas OUTSIDE the content zone */}
      
      {/* Top hover area */}
      <div 
        className="absolute top-0 left-0 right-0 pointer-events-auto"
        style={{ height: '120px', top: '-120px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Bottom hover area */}
      <div 
        className="absolute bottom-0 left-0 right-0 pointer-events-auto"
        style={{ height: '120px', bottom: '-120px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Left hover area */}
      <div 
        className="absolute top-0 bottom-0 left-0 pointer-events-auto"
        style={{ width: '120px', left: '-120px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Right hover area */}
      <div 
        className="absolute top-0 bottom-0 right-0 pointer-events-auto"
        style={{ width: '120px', right: '-120px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Action buttons positioned absolutely and isolated from content */}
      {/* Top action button */}
      {activeSides.top && (
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center transition-all duration-300 ease-out pointer-events-auto z-20 ${
            hoveredQuarter === 'top'
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-75 translate-y-4'
          }`}
          style={{ top: '-60px' }}
          onClick={() => onAction('top')}
          onMouseEnter={() => setHoveredQuarter('top')}
        >
          <Button
            size="icon"
            variant={buttonVariant}
            className="rounded-full"
            aria-label="Action Top"
            disabled={isDisabled}
          >
            <Icon className={getIconRotation('top')} />
          </Button>
        </div>
      )}

      {/* Right action button */}
      {activeSides.right && (
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center transition-all duration-300 ease-out pointer-events-auto z-20 ${
            hoveredQuarter === 'right'
              ? 'opacity-100 scale-100 translate-x-0'
              : 'opacity-0 scale-75 -translate-x-4'
          }`}
          style={{ right: '-60px' }}
          onClick={() => onAction('right')}
          onMouseEnter={() => setHoveredQuarter('right')}
        >
          <Button
            size="icon"
            variant={buttonVariant}
            className="rounded-full"
            aria-label="Action Right"
            disabled={isDisabled}
          >
            <Icon className={getIconRotation('right')} />
          </Button>
        </div>
      )}

      {/* Bottom action button */}
      {activeSides.bottom && (
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center transition-all duration-300 ease-out pointer-events-auto z-20 ${
            hoveredQuarter === 'bottom'
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-75 -translate-y-4'
          }`}
          style={{ bottom: '-60px' }}
          onClick={() => onAction('bottom')}
          onMouseEnter={() => setHoveredQuarter('bottom')}
        >
          <Button
            size="icon"
            variant={buttonVariant}
            className="rounded-full"
            aria-label="Action Bottom"
            disabled={isDisabled}
          >
            <Icon className={getIconRotation('bottom')} />
          </Button>
        </div>
      )}

      {/* Left action button */}
      {activeSides.left && (
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center transition-all duration-300 ease-out pointer-events-auto z-20 ${
            hoveredQuarter === 'left'
              ? 'opacity-100 scale-100 translate-x-0'
              : 'opacity-0 scale-75 translate-x-4'
          }`}
          style={{ left: '-60px' }}
          onClick={() => onAction('left')}
          onMouseEnter={() => setHoveredQuarter('left')}
        >
          <Button
            size="icon"
            variant={buttonVariant}
            className="rounded-full"
            aria-label="Action Left"
            disabled={isDisabled}
          >
            <Icon className={getIconRotation('left')} />
          </Button>
        </div>
      )}
    </>
  );
};
