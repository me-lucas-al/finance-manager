import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Amount } from '@/components/shared/Amount';
import { ProgressBar } from '@/components/shared/ProgressBar';
import type { CreditCardOverview } from '@/types/overview';
import { OverviewCardLabel } from './OverviewCardLabel';

export function CreditCardsCard({ credit }: { credit: CreditCardOverview }) {
  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm hover:border-zinc-700/60 transition-colors">
      <CardHeader className="pb-3 pt-5 px-6">
        <OverviewCardLabel icon={<CreditCard className="h-4 w-4 text-blue-500" />}>
          CARTÕES DE CRÉDITO
        </OverviewCardLabel>
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
        {credit.cards.map((card) => (
          <div
            key={card.id}
            className="flex items-center justify-between border-t border-zinc-800/50 pt-3 first:border-0 first:pt-0"
          >
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
        ))}
      </CardContent>
    </Card>
  );
}
