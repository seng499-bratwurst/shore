'use client';

import { Button } from '@/components/ui/button/button';
import Image from 'next/image';
import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { TutorialStep } from './types';

interface TutorialCarouselProps {
  steps: TutorialStep[];
  onCloseAction: () => void;
}

export const TutorialCarousel: React.FC<TutorialCarouselProps> = ({ steps, onCloseAction }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleDotClick = (index: number) => {
    setCurrentStepIndex(index);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Graph Chat Tutorial</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCloseAction}
          className="h-8 w-8"
          aria-label="Close tutorial"
        >
          <FiX size={16} />
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* GIF Display */}
        <div className="aspect-video bg-muted rounded-lg overflow-hidden relative min-h-[200px] max-h-[400px]">
          <Image
            src={currentStep.gifPath}
            alt={`${currentStep.title} demonstration`}
            fill
            className="object-cover rounded-lg"
            unoptimized
          />
        </div>

        {/* Step Content */}
        <div className="space-y-3 px-8">
          <h3 className="text-lg font-medium text-center">{currentStep.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed text-left">
            {currentStep.description}
          </p>
        </div>

        {/* Step Indicator Dots */}
        <div className="flex justify-center space-x-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStepIndex
                  ? 'bg-primary'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-3 items-center pt-6">
          <div className="flex justify-start">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2 min-w-[100px]"
            >
              <FiChevronLeft size={16} />
              Previous
            </Button>
          </div>

          <div className="flex justify-center">
            <span className="text-sm text-muted-foreground">
              {currentStepIndex + 1} of {steps.length}
            </span>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={isLastStep ? onCloseAction : handleNext}
              className="flex items-center gap-2 min-w-[100px]"
            >
              {isLastStep ? (
                'Done'
              ) : (
                <>
                  Next
                  <FiChevronRight size={16} />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
