import { toLocalDateString } from '@/lib/month';
import type { Account } from '@/modules/open-finance/domain/repositories/account-repository';
import type { TransactionRepository } from '@/modules/open-finance/domain/repositories/transaction-repository';
import type { LedgerWriter } from '../domain/ledger-writer';
import type { PluggyLedgerEntry } from '../domain/map-pluggy-transaction';
import type { SyncPeriod } from '../domain/sync-period';

export class PersistLedgerEntry {
  constructor(
    private ledger: LedgerWriter,
    private transactions: TransactionRepository,
  ) {}

  async execute(userId: string, account: Account, entry: PluggyLedgerEntry, period: SyncPeriod): Promise<boolean> {
    if (entry.kind === 'income') return this.persistIncome(userId, entry, period);
    if (entry.kind === 'investment') return this.persistInvestment(userId, entry, period);
    return this.persistExpense(userId, account, entry);
  }

  private persistIncome(userId: string, entry: Extract<PluggyLedgerEntry, { kind: 'income' }>, period: SyncPeriod) {
    return this.ledger.addIncome({
      userId,
      periodId: period.id,
      externalId: entry.externalId,
      amount: entry.amount,
      description: entry.description,
      category: entry.category,
      receivedAt: entry.date,
    });
  }

  private persistInvestment(userId: string, entry: Extract<PluggyLedgerEntry, { kind: 'investment' }>, period: SyncPeriod) {
    return this.ledger.addInvestment({
      userId,
      periodId: period.id,
      externalId: entry.externalId,
      amount: entry.amount,
      description: entry.description,
      type: entry.type,
      date: entry.date,
    });
  }

  private async persistExpense(userId: string, account: Account, entry: Extract<PluggyLedgerEntry, { kind: 'expense' }>) {
    const alreadyStored = await this.transactions.findByPluggyId(entry.externalId);
    if (alreadyStored) return false;

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
    });
    return true;
  }
}
