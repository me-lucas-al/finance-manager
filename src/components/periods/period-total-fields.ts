import type { LedgerTotals } from '@/modules/finance/domain/services/summarize-ledger';

type PeriodTotalField = {
  key: keyof LedgerTotals;
  label: string;
  className: string;
};

export const PERIOD_TOTAL_FIELDS: PeriodTotalField[] = [
  { key: 'income', label: 'Receitas', className: 'text-emerald-400' },
  { key: 'expenses', label: 'Despesas', className: 'text-blue-500' },
  { key: 'investments', label: 'Investimentos', className: 'text-sky-400' },
  { key: 'balance', label: 'Saldo', className: 'text-foreground' },
];
