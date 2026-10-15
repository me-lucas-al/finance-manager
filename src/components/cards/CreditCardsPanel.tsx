'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CreditCardUsage } from '@/modules/finance/domain/models/credit-card';
import { CreditCardListItem } from './CreditCardListItem';
import { CreditCardsDialogs } from './CreditCardsDialogs';
import { useCreditCardDialogs } from './useCreditCardDialogs';

export function CreditCardsPanel({ usages }: { usages: CreditCardUsage[] }) {
  const dialogs = useCreditCardDialogs();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Meus cartões</h2>
        <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-500" onClick={dialogs.openCreate}>
          <Plus className="h-3.5 w-3.5" /> Novo cartão
        </Button>
      </div>
      {usages.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum cartão cadastrado ainda.</p>
      ) : (
        <ul>
          {usages.map((usage) => (
            <CreditCardListItem key={usage.card.id} usage={usage} onEdit={dialogs.openEdit} onDelete={dialogs.openDelete} />
          ))}
        </ul>
      )}
      <CreditCardsDialogs dialog={dialogs.dialog} onClose={dialogs.close} />
    </div>
  );
}
