import { Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { BalancePoint } from '@/types/overview';
import { BalanceEvolutionChart } from './BalanceEvolutionChart';
import { OverviewCardLabel } from './OverviewCardLabel';

interface BalanceEvolutionCardProps {
  balance?: number;
  data?: BalancePoint[];
}

export function BalanceEvolutionCard({ balance = 0, data = [] }: BalanceEvolutionCardProps) {
  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm hover:border-zinc-700/60 transition-colors">
      <CardHeader className="pb-0 pt-6 px-6">
        <OverviewCardLabel icon={<Wallet className="h-4 w-4 text-zinc-400" />}>
          EVOLUÇÃO DO SALDO
        </OverviewCardLabel>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-2">
        <BalanceEvolutionChart initialBalance={balance} data={data} />
      </CardContent>
    </Card>
  );
}
