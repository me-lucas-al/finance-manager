import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

type StepControlsProps = {
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
  finishLabel: string;
  onFinish?: () => void;
  finishDisabled?: boolean;
  finishPending?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export function StepControls(props: StepControlsProps) {
  const { isFirst, isLast, onPrev, onNext, finishLabel, onFinish, finishDisabled, finishPending } = props;
  const { secondaryLabel, onSecondary } = props;

  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <Button type="button" variant="outline" onClick={onPrev} disabled={isFirst}>
        <ArrowLeft className="h-4 w-4" />
        Anterior
      </Button>
      <div className="flex items-center gap-2">
        {secondaryLabel && onSecondary ? (
          <Button type="button" variant="ghost" onClick={onSecondary}>
            {secondaryLabel}
          </Button>
        ) : null}
        {isLast ? (
          <Button type="button" onClick={onFinish} disabled={finishDisabled || finishPending}>
            <Check className="h-4 w-4" />
            {finishPending ? 'Aguarde…' : finishLabel}
          </Button>
        ) : (
          <Button type="button" onClick={onNext}>
            Próximo
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
