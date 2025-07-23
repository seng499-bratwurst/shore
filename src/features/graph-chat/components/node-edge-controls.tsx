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
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Use the provided enabledSides directly
  const activeSides = enabledSides;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // The container extends 120px around the node, so the actual node is in the center
    const nodeLeft = 120;
    const nodeRight = rect.width - 120;
    const nodeTop = 120;
    const nodeBottom = rect.height - 120;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate distance from node edges
    let distanceFromNode = 0;

    if (x < nodeLeft) {
      // Left side
      distanceFromNode = nodeLeft - x;
    } else if (x > nodeRight) {
      // Right side
      distanceFromNode = x - nodeRight;
    }

    if (y < nodeTop) {
      // Top side
      const topDistance = nodeTop - y;
      distanceFromNode = Math.max(distanceFromNode, topDistance);
    } else if (y > nodeBottom) {
      // Bottom side
      const bottomDistance = y - nodeBottom;
      distanceFromNode = Math.max(distanceFromNode, bottomDistance);
    }

    // If mouse is more than 120px from node edge, hide buttons
    if (distanceFromNode > 120) {
      setHoveredQuarter(null);
      return;
    }

    // Determine which diagonal quarter the mouse is in relative to center
    const relativeX = x - centerX;
    const relativeY = y - centerY;

    if (Math.abs(relativeX) > Math.abs(relativeY)) {
      // Horizontal quarters
      setHoveredQuarter(relativeX > 0 ? 'right' : 'left');
    } else {
      // Vertical quarters
      setHoveredQuarter(relativeY > 0 ? 'bottom' : 'top');
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only hide if mouse is actually leaving the entire container area
    const relatedTarget = e.relatedTarget;
    if (
      containerRef.current &&
      (!relatedTarget ||
        !(relatedTarget instanceof Node) ||
        !containerRef.current.contains(relatedTarget))
    ) {
      setHoveredQuarter(null);
    }
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
    <div ref={containerRef} className="absolute inset-0 -m-[120px]">
      {/* Hitbox area extending up to 120px around the node */}
      <div
        className="absolute inset-0 cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      {/* Top action button */}
      {activeSides.top && (
        <div
          className={`absolute top-[70px] left-1/2 transform -translate-x-1/2 flex items-center justify-center transition-all duration-300 ease-out ${
            hoveredQuarter === 'top'
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-75 translate-y-4'
          }`}
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
          className={`absolute right-[70px] top-1/2 transform -translate-y-1/2 flex items-center justify-center transition-all duration-300 ease-out ${
            hoveredQuarter === 'right'
              ? 'opacity-100 scale-100 translate-x-0'
              : 'opacity-0 scale-75 -translate-x-4'
          }`}
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
          className={`absolute bottom-[70px] left-1/2 transform -translate-x-1/2 flex items-center justify-center transition-all duration-300 ease-out ${
            hoveredQuarter === 'bottom'
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-75 -translate-y-4'
          }`}
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
          className={`absolute left-[70px] top-1/2 transform -translate-y-1/2 flex items-center justify-center transition-all duration-300 ease-out ${
            hoveredQuarter === 'left'
              ? 'opacity-100 scale-100 translate-x-0'
              : 'opacity-0 scale-75 translate-x-4'
          }`}
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
    </div>
  );
};
