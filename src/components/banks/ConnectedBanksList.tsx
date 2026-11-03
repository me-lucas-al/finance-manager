import { Landmark } from 'lucide-react';
import type { ConnectedBank } from '@/modules/open-finance/domain/connected-bank';
import { BankHealthBadge } from './BankHealthBadge';
import { describeBankDetails } from './describe-bank-details';

export function ConnectedBanksList({ banks }: { banks: ConnectedBank[] | null }) {
  if (banks === null) return <p className="text-sm text-zinc-400">Não foi possível carregar os bancos conectados.</p>;
  if (banks.length === 0) return <p className="text-sm text-zinc-400">Nenhum banco conectado ainda.</p>;

  return (
    <ul className="space-y-2">
      {banks.map((bank) => (
        <li
          key={bank.itemId}
          className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2.5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <Landmark aria-hidden="true" className="h-4 w-4 shrink-0 text-blue-400" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{bank.name}</p>
              <p className="text-xs text-zinc-400">{describeBankDetails(bank)}</p>
            </div>
          </div>
          <BankHealthBadge health={bank.health} />
        </li>
      ))}
    </ul>
  );
}
