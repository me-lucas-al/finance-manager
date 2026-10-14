'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Amount } from '@/components/shared/Amount';
import type { BankAccountSummary } from '@/types/overview';
import { BankBadge } from './BankBadge';

export function BankAccountRow({ account }: { account: BankAccountSummary }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const ChevronIcon = isExpanded ? ChevronUp : ChevronDown;

  return (
    <div className="border-t border-zinc-800/50 pt-3 first:border-0 first:pt-0">
      <button
        type="button"
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-between cursor-pointer group outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-lg p-1 -m-1 text-left"
        onClick={() => setIsExpanded((current) => !current)}
      >
        <div className="flex items-center gap-3">
          <BankBadge bank={account.bank} accountName={account.name} />
          <div>
            <span className="text-sm font-medium text-white group-hover:text-zinc-200">
              {account.name}
            </span>
            <p className="text-xs text-zinc-500">{account.countText}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Amount value={account.amount} className="text-sm font-semibold text-emerald-400" />
          <ChevronIcon className="h-3.5 w-3.5 text-zinc-500" />
        </div>
      </button>
      {isExpanded && (
        <div className="mt-2 pl-10 pr-2 py-1.5 text-xs text-zinc-400 bg-zinc-900/40 rounded-lg">
          <span>Conta Corrente ativa · Sincronizado via Open Finance</span>
        </div>
      )}
    </div>
  );
}
