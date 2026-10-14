import { CarouselItem } from '@/components/ui/carousel';
import type { CarouselStep } from './carousel-step';

type StepSlideProps = {
  step: CarouselStep;
  position: number;
  active: boolean;
};

export function StepSlide({ step, position, active }: StepSlideProps) {
  const Icon = step.icon;
  return (
    <CarouselItem aria-hidden={!active} data-testid={`carousel-step-${position}`}>
      <div className="flex min-h-[320px] flex-col items-center gap-4 rounded-2xl border border-zinc-800/80 bg-[#111216] p-6 text-center sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30">
          <Icon className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">{step.title}</h3>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-400">{step.description}</p>
        </div>
        {step.content ? <div className="mt-2 w-full max-w-md">{step.content}</div> : null}
      </div>
    </CarouselItem>
  );
}
