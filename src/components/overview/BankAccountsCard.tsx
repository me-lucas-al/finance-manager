import { Landmark } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Amount } from '@/components/shared/Amount';
import type { BankOverview } from '@/types/overview';
import { BankAccountRow } from './BankAccountRow';
import { OverviewCardLinkLabel } from './OverviewCardLinkLabel';

export function BankAccountsCard({ bank }: { bank: BankOverview }) {
  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm hover:border-zinc-700/60 transition-colors">
      <CardHeader className="pb-3 pt-5 px-6">
        <OverviewCardLinkLabel href="/movements" icon={<Landmark className="h-4 w-4 text-zinc-400" />}>
          CONTAS BANCÁRIAS
        </OverviewCardLinkLabel>
        <div className="mt-2">
          <Amount value={bank.total} className="text-3xl font-bold tracking-tight text-white" />
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-5 pt-1 space-y-3">
        {bank.accounts.map((account) => (
          <BankAccountRow key={account.id} account={account} />
        ))}
      </CardContent>
    </Card>
  );
}
