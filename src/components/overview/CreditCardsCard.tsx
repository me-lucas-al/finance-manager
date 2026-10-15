import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Amount } from '@/components/shared/Amount';
import { ProgressBar } from '@/components/shared/ProgressBar';
import type { CreditCardOverview } from '@/types/overview';
import { CreditCardRow } from './CreditCardRow';
import { CreditCardsEmptyState } from './CreditCardsEmptyState';
import { OverviewCardLabel } from './OverviewCardLabel';
import { OverviewCardLinkLabel } from './OverviewCardLinkLabel';

function CardsLabel({ manual }: { manual: boolean }) {
  const icon = <CreditCard className="h-4 w-4 text-blue-500" />;
  if (manual) return <OverviewCardLinkLabel href="/cards" icon={icon}>CARTÕES DE CRÉDITO</OverviewCardLinkLabel>;
  return <OverviewCardLabel icon={icon}>CARTÕES DE CRÉDITO</OverviewCardLabel>;
}

export function CreditCardsCard({ credit }: { credit: CreditCardOverview }) {
  const manual = credit.source === 'manual';
  const isEmpty = manual && credit.cards.length === 0;

  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm hover:border-zinc-700/60 transition-colors">
      <CardHeader className="pb-3 pt-5 px-6">
        <CardsLabel manual={manual} />
        <div className="mt-2">
          <Amount value={credit.total} className="text-3xl font-bold tracking-tight text-blue-500" />
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{credit.usedPercentage}% utilizado</span>
            <span>
              Limite: <Amount value={credit.limit} />
            </span>
          </div>
          <ProgressBar percentage={credit.usedPercentage} />
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-5 pt-1 space-y-3">
        {isEmpty && <CreditCardsEmptyState />}
        {credit.cards.map((card) => (
          <CreditCardRow key={card.id} card={card} />
        ))}
      </CardContent>
    </Card>
  );
}
