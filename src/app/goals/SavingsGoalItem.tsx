import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/format';

interface SavingsGoalItemProps {
  title: string;
  currentAmount: number;
  targetAmount: number;
  targetDate: string | null;
}

export function SavingsGoalItem({ title, currentAmount, targetAmount, targetDate }: SavingsGoalItemProps) {
  const percent = targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-white">{title}</span>
        <span className="text-zinc-400">
          {formatCurrency(currentAmount)} de {formatCurrency(targetAmount)}
        </span>
      </div>
      <Progress value={percent} />
      {targetDate && <p className="text-xs text-zinc-500">até {targetDate}</p>}
    </div>
  );
}
