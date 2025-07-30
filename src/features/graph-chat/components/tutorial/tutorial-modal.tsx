'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import React from 'react';
import { TutorialCarousel } from './tutorial-carousel';
import { tutorialSteps } from './types';

interface TutorialModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onCloseAction }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          className="sm:max-w-[700px] w-full max-h-[90vh] overflow-y-auto"
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Graph Chat Tutorial</DialogTitle>
          </DialogHeader>
          <TutorialCarousel steps={tutorialSteps} onCloseAction={onCloseAction} />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
