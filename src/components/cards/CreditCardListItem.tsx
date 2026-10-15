import { Amount } from '@/components/shared/Amount';
import { ProgressBar } from '@/components/shared/ProgressBar';
import type { CreditCard, CreditCardUsage } from '@/modules/finance/domain/models/credit-card';
import { CreditCardMenu } from './CreditCardMenu';

type CreditCardListItemProps = {
  usage: CreditCardUsage;
  onEdit: (card: CreditCard) => void;
  onDelete: (card: CreditCard) => void;
};

function cardSubtitle({ card }: CreditCardUsage): string {
  const digits = card.lastDigits ? `•••• ${card.lastDigits}` : 'Sem final';
  const closing = card.closingDay ? `fecha dia ${card.closingDay}` : 'fatura do mês corrente';
  return `${digits} · ${closing}`;
}

export function CreditCardListItem({ usage, onEdit, onDelete }: CreditCardListItemProps) {
  const { card, used, percentage } = usage;
  return (
    <li className="space-y-2 border-t border-zinc-800/50 py-3 first:border-0 first:pt-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{card.name}</p>
          <p className="text-xs text-zinc-500">{cardSubtitle(usage)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Amount value={used} className="text-sm font-semibold text-blue-500" />
          <CreditCardMenu card={card} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
      <ProgressBar percentage={percentage} />
      <p className="text-xs text-zinc-500">
        {percentage}% de <Amount value={card.creditLimit} /> na fatura aberta
      </p>
    </li>
  );
}
