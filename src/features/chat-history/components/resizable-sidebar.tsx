'use client';

import { cn } from '@/lib/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ResizableSidebarProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
}

export function ResizableSidebar({ 
  children, 
  defaultWidth = 256, // 16rem in pixels
  minWidth = 200,
  maxWidth = 400,
  className 
}: ResizableSidebarProps) {
  const [sidebarWidth, setSidebarWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
    
    const startX = mouseDownEvent.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
      const deltaX = mouseMoveEvent.clientX - startX;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + deltaX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Remove user-select: none from body
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [sidebarWidth, minWidth, maxWidth]);

  // Handle keyboard shortcuts for resizing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey) {
        if (event.key === '[') {
          event.preventDefault();
          setSidebarWidth(current => Math.max(minWidth, current - 20));
        } else if (event.key === ']') {
          event.preventDefault();
          setSidebarWidth(current => Math.min(maxWidth, current + 20));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [minWidth, maxWidth]);

  // Apply the width to the CSS custom property on the container
  useEffect(() => {
    if (containerRef.current) {
      // Update the CSS custom property that the sidebar uses
      const sidebarWrapper = containerRef.current.closest('[data-slot="sidebar-wrapper"]');
      if (sidebarWrapper) {
        (sidebarWrapper as HTMLElement).style.setProperty('--sidebar-width', `${sidebarWidth}px`);
      }
    }
  }, [sidebarWidth]);

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
    >
      {children}
      
      {/* Resize handle */}
      <div
        className={cn(
          'absolute top-0 right-0 w-2 h-full cursor-col-resize z-50 group',
          'bg-transparent hover:bg-border/30 transition-colors duration-200',
          // Expand hit area for easier dragging
          'after:absolute after:inset-y-0 after:-left-1 after:-right-1 after:w-4',
          isResizing && 'bg-border/50'
        )}
        onMouseDown={startResizing}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        title="Drag to resize sidebar (Ctrl+Shift+[ or ] to adjust)"
      >
        {/* Visual resize indicator */}
        <div 
          className={cn(
            'absolute top-0 right-0 w-0.5 h-full bg-border/60 transition-opacity duration-200',
            (isHovering || isResizing) ? 'opacity-100' : 'opacity-0'
          )}
        />
        
        {/* Resize dots indicator */}
        <div 
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-1 h-6 bg-muted-foreground/40 rounded-full transition-opacity duration-200',
            'before:absolute before:top-0 before:left-0.5 before:w-0.5 before:h-1.5 before:bg-current before:rounded-full',
            'after:absolute after:bottom-0 after:left-0.5 after:w-0.5 after:h-1.5 after:bg-current after:rounded-full',
            (isHovering || isResizing) ? 'opacity-60' : 'opacity-0'
          )}
        />
      </div>
    </div>
  );
}
