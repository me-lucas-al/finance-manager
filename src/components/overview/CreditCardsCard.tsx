import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { CreditCardOverviews } from '@/types/overview';
import { CreditCardGroup } from './CreditCardGroup';
import { CreditCardsEmptyState } from './CreditCardsEmptyState';
import { OverviewCardLinkLabel } from './OverviewCardLinkLabel';

export function CreditCardsCard({ credit }: { credit: CreditCardOverviews }) {
  const isEmpty = credit.connected.cards.length === 0 && credit.manual.cards.length === 0;

  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm hover:border-zinc-700/60 transition-colors">
      <CardHeader className="pb-3 pt-5 px-6">
        <OverviewCardLinkLabel href="/cards" icon={<CreditCard className="h-4 w-4 text-blue-500" />}>
          CARTÕES DE CRÉDITO
        </OverviewCardLinkLabel>
      </CardHeader>
      <CardContent className="px-6 pb-5 pt-1 space-y-6">
        {isEmpty && <CreditCardsEmptyState />}
        <CreditCardGroup title="Conectados ao banco" overview={credit.connected} />
        <CreditCardGroup title="Cadastrados manualmente" overview={credit.manual} />
      </CardContent>
    </Card>
  );
}
