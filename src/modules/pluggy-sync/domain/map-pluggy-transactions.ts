import { sanitizeTransactions } from './classification';
import {
  entryFromClassification,
  type PluggyLedgerEntry,
  type PluggyTransactionLike,
} from './map-pluggy-transaction';

const SETTLED_STATUS = 'POSTED';
const LEDGER_CURRENCY = 'BRL';

export type TransactionSource<Origin> = {
  tx: PluggyTransactionLike;
  isCreditCard: boolean;
  origin: Origin;
};

export type MappedTransaction<Origin> = { origin: Origin; entry: PluggyLedgerEntry };

export function isSettledLocalTransaction(tx: PluggyTransactionLike): boolean {
  const isSettled = !tx.status || tx.status === SETTLED_STATUS;
  const isLocalCurrency = !tx.currencyCode || tx.currencyCode === LEDGER_CURRENCY;
  return isSettled && isLocalCurrency;
}

export function mapPluggyTransactions<Origin>(
  sources: TransactionSource<Origin>[],
  hasCreditCardPurchases: boolean,
): MappedTransaction<Origin>[] {
  const eligible = sources.filter((source) => isSettledLocalTransaction(source.tx));
  const { sanitized } = sanitizeTransactions(
    eligible.map((source) => ({ ...source.tx, isCreditCard: source.isCreditCard })),
    { hasCreditCardPurchases },
  );
  return sanitized.flatMap(({ raw, classification }, index) => {
    const entry = entryFromClassification(raw, classification);
    return entry ? [{ origin: eligible[index].origin, entry }] : [];
  });
}
