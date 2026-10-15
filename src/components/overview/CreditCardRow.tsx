import { CreditCard } from 'lucide-react';
import { Amount } from '@/components/shared/Amount';
import { ProgressBar } from '@/components/shared/ProgressBar';
import type { CreditCardSummary } from '@/types/overview';

function CardUsage({ card }: { card: CreditCardSummary }) {
  if (card.limit === undefined) return null;
  return (
    <div className="mt-2 space-y-1">
      <ProgressBar percentage={card.usedPercentage ?? 0} />
      <p className="text-[11px] text-zinc-500">
        {card.usedPercentage ?? 0}% de <Amount value={card.limit} />
      </p>
    </div>
  );
}

export function CreditCardRow({ card }: { card: CreditCardSummary }) {
  return (
    <div className="border-t border-zinc-800/50 pt-3 first:border-0 first:pt-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-md bg-zinc-800/80 flex items-center justify-center border border-zinc-700/40">
            <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{card.name}</p>
            <p className="text-xs text-zinc-500">{card.digits}</p>
          </div>
        </div>
        <Amount value={card.amount} className="text-sm font-semibold text-blue-500" />
      </div>
      <CardUsage card={card} />
    </div>
  );
}
