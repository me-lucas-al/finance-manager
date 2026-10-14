import type { LedgerKind } from '../models/ledger-entry';

export function signedAmount(kind: LedgerKind, amount: number): number {
  return kind === 'income' ? Math.abs(amount) : -Math.abs(amount);
}
