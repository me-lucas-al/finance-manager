import { Amount } from '@/components/shared/Amount';
import { ProgressBar } from '@/components/shared/ProgressBar';

interface InvestmentClassesViewProps {
  count: number;
  total: number;
}

export function InvestmentClassesView({ count, total }: InvestmentClassesViewProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-zinc-300">
        <span className="font-medium">Renda Fixa ({count})</span>
        <span className="font-medium">
          100.0% <Amount value={total} />
        </span>
      </div>
      <ProgressBar percentage={100} />
    </div>
  );
}
