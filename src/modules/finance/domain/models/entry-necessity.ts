import type { TransactionNecessity } from '@/modules/open-finance/domain/repositories/transaction-repository';

export const ENTRY_NECESSITIES = ['essencial', 'importante', 'superfluo'] as const satisfies readonly TransactionNecessity[];

export function isEntryNecessity(value: unknown): value is TransactionNecessity {
  return ENTRY_NECESSITIES.some((necessity) => necessity === value);
}
