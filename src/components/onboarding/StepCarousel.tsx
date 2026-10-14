'use client';

import { Carousel, CarouselContent } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import type { CarouselStep } from './carousel-step';
import { StepControls } from './StepControls';
import { StepDots } from './StepDots';
import { StepProgress } from './StepProgress';
import { StepSlide } from './StepSlide';
import { useCarouselProgress } from './useCarouselProgress';

export type { CarouselStep } from './carousel-step';

type StepCarouselProps = {
  steps: CarouselStep[];
  finishLabel?: string;
  onFinish?: () => void;
  finishDisabled?: boolean;
  finishPending?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  className?: string;
};

export function StepCarousel({ steps, finishLabel = 'Concluir', className, ...controls }: StepCarouselProps) {
  const progress = useCarouselProgress(steps.length);

  return (
    <div className={cn('w-full', className)}>
      <StepProgress
        current={progress.current}
        total={steps.length}
        title={steps[progress.current]?.title}
        percent={progress.progressPercent}
      />

      <Carousel setApi={progress.setApi} opts={{ watchDrag: false, duration: 25 }} className="w-full">
        <CarouselContent>
          {steps.map((step, index) => (
            <StepSlide key={step.title} step={step} position={index + 1} active={index === progress.current} />
          ))}
        </CarouselContent>
      </Carousel>

      <StepDots titles={steps.map((step) => step.title)} current={progress.current} onSelect={progress.scrollTo} />

      <StepControls
        {...controls}
        finishLabel={finishLabel}
        isFirst={progress.isFirst}
        isLast={progress.isLast}
        onPrev={progress.scrollPrev}
        onNext={progress.scrollNext}
      />
    </div>
  );
}
