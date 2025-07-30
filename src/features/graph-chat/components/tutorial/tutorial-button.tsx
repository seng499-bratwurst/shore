'use client';

import { Button } from '@/components/ui/button/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip/tooltip';
import React, { useState } from 'react';
import { FiHelpCircle } from 'react-icons/fi';
import { TutorialModal } from './tutorial-modal';

export const TutorialButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleCloseAction = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleOpen} aria-label="Open tutorial">
            <FiHelpCircle size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">Tutorial</TooltipContent>
      </Tooltip>

      <TutorialModal isOpen={isOpen} onCloseAction={handleCloseAction} />
    </>
  );
};
