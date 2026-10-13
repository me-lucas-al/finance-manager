import { ArrowDownLeft, ArrowUpRight, PiggyBank, type LucideIcon } from 'lucide-react';
import type { LiveTransactionItem } from '@/modules/finance/domain/models/financial-types';

type EntryKind = LiveTransactionItem['type'];

type EntryKindStyle = {
  label: string;
  Icon: LucideIcon;
  boxClass: string;
  iconClass: string;
  amountClass: string;
};

export const ENTRY_KIND_STYLE: Record<EntryKind, EntryKindStyle> = {
  expense: {
    label: 'Saídas',
    Icon: ArrowUpRight,
    boxClass: 'bg-blue-950/40 border-blue-800/40',
    iconClass: 'text-blue-400',
    amountClass: 'text-blue-500',
  },
  income: {
    label: 'Entradas',
    Icon: ArrowDownLeft,
    boxClass: 'bg-emerald-950/40 border-emerald-800/40',
    iconClass: 'text-emerald-400',
    amountClass: 'text-emerald-400',
  },
  investment: {
    label: 'Investimentos',
    Icon: PiggyBank,
    boxClass: 'bg-sky-950/40 border-sky-800/40',
    iconClass: 'text-sky-400',
    amountClass: 'text-sky-400',
  },
};

export function signedAmount(kind: EntryKind, amount: number): number {
  return kind === 'income' ? Math.abs(amount) : -Math.abs(amount);
}
