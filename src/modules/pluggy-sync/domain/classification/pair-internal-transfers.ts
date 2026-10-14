import { TRANSFER_OR_PIX } from './patterns';
import type { RawTransactionLike } from './types';

const MAX_PAIRING_DAYS = 2;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const isCredit = (tx: RawTransactionLike): boolean => tx.type === 'CREDIT' || Number(tx.amount) > 0;
const absolute = (tx: RawTransactionLike): number => Math.abs(Number(tx.amount));
const dayOf = (tx: RawTransactionLike): number => new Date(String(tx.date).slice(0, 10)).getTime();

const isTransferCandidate = (tx: RawTransactionLike): boolean =>
  !tx.isCreditCard && absolute(tx) > 0 && (tx.category === 'Transfers' || TRANSFER_OR_PIX.test(tx.description || ''));

function arePair(first: RawTransactionLike, second: RawTransactionLike): boolean {
  if (isCredit(first) === isCredit(second)) return false;
  if (Math.abs(absolute(first) - absolute(second)) >= 0.01) return false;
  return Math.abs(dayOf(first) - dayOf(second)) / MILLISECONDS_PER_DAY <= MAX_PAIRING_DAYS;
}

export function pairInternalTransfers(transactions: RawTransactionLike[]): Set<number> {
  const paired = new Set<number>();
  transactions.forEach((first, i) => {
    if (paired.has(i) || !isTransferCandidate(first)) return;
    const matchIndex = transactions.findIndex(
      (second, j) => j > i && !paired.has(j) && isTransferCandidate(second) && arePair(first, second),
    );
    if (matchIndex === -1) return;
    paired.add(i);
    paired.add(matchIndex);
  });
  return paired;
}
