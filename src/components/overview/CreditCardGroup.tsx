import { Amount } from '@/components/shared/Amount';
import { ProgressBar } from '@/components/shared/ProgressBar';
import type { CreditCardOverview } from '@/types/overview';
import { CreditCardRow } from './CreditCardRow';

type CreditCardGroupProps = {
  title: string;
  overview: CreditCardOverview;
};

export function CreditCardGroup({ title, overview }: CreditCardGroupProps) {
  if (overview.cards.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{title}</h3>
          <Amount value={overview.total} className="text-xl font-bold tracking-tight text-blue-500" />
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>{overview.usedPercentage}% utilizado</span>
          <span>
            Limite: <Amount value={overview.limit} />
          </span>
        </div>
        <ProgressBar percentage={overview.usedPercentage} />
      </div>
      {overview.cards.map((card) => (
        <CreditCardRow key={card.id} card={card} />
      ))}
    </section>
  );
}
