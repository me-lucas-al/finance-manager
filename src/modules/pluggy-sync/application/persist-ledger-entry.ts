import { toLocalDateString } from '@/lib/month';
import type { Account } from '@/modules/open-finance/domain/repositories/account-repository';
import type { TransactionRepository } from '@/modules/open-finance/domain/repositories/transaction-repository';
import { toPeriodReference, type PeriodReference } from '@/modules/periods/domain/period-reference';
import type { LedgerWriter } from '../domain/ledger-writer';
import type { PluggyLedgerEntry } from '../domain/map-pluggy-transaction';
import type { SyncPeriod } from '../domain/sync-period';

const isDuplicateKeyError = (error: unknown): boolean =>
  error instanceof Error && /duplicate key|23505/i.test(error.message);

export class PersistLedgerEntry {
  constructor(
    private ledger: LedgerWriter,
    private transactions: TransactionRepository,
  ) {}

  async execute(userId: string, account: Account, entry: PluggyLedgerEntry, period: SyncPeriod): Promise<boolean> {
    const reference = toPeriodReference(period);
    if (entry.kind === 'income') return this.persistIncome(userId, entry, reference);
    if (entry.kind === 'investment') return this.persistInvestment(userId, entry, reference);
    return this.persistExpense(userId, account, entry, reference);
  }

  private persistIncome(userId: string, entry: Extract<PluggyLedgerEntry, { kind: 'income' }>, reference: PeriodReference) {
    return this.ledger.addIncome({
      userId,
      ...reference,
      externalId: entry.externalId,
      amount: entry.amount,
      description: entry.description,
      category: entry.category,
      receivedAt: entry.date,
    });
  }

  private persistInvestment(userId: string, entry: Extract<PluggyLedgerEntry, { kind: 'investment' }>, reference: PeriodReference) {
    return this.ledger.addInvestment({
      userId,
      ...reference,
      externalId: entry.externalId,
      amount: entry.amount,
      description: entry.description,
      type: entry.type,
      date: entry.date,
    });
  }

  private async persistExpense(
    userId: string,
    account: Account,
    entry: Extract<PluggyLedgerEntry, { kind: 'expense' }>,
    reference: PeriodReference,
  ) {
    const alreadyStored = await this.transactions.findByPluggyId(entry.externalId);
    if (alreadyStored) return false;

    try {
      await this.transactions.create({
        userId,
        pluggyTransactionId: entry.externalId,
        accountId: account.id,
        bank: account.bank,
        amount: entry.amount,
        description: entry.description,
        occurredAt: toLocalDateString(entry.date),
        category: entry.category,
        categorySuggested: null,
        reason: null,
        status: 'categorized',
        source: 'pluggy',
        necessity: null,
        telegramQuestionMessageId: null,
        ...reference,
      });
      return true;
    } catch (error) {
      if (isDuplicateKeyError(error)) return false;
      throw error;
    }
  }
}
