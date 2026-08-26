import type { Transaction as PluggyTransaction } from 'pluggy-sdk';
import { fetchAccountType, fetchItemBankName } from '@/lib/pluggy';
import type { AccountRepository } from '../../domain/repositories/account-repository';
import type { Transaction, TransactionRepository } from '../../domain/repositories/transaction-repository';

export class IngestPluggyTransactionUseCase {
  constructor(
    private accountRepository: AccountRepository,
    private transactionRepository: TransactionRepository,
  ) {}

  private async ensureAccount(userId: string, itemId: string, accountId: string) {
    const existing = await this.accountRepository.findByPluggyAccountId(accountId);
    if (existing) {
      // Re-upsert on every ingestion so last_synced_at reflects the most
      // recent sync instead of freezing at the account's first-ever transaction.
      return this.accountRepository.upsert({
        userId: existing.userId,
        pluggyAccountId: existing.pluggyAccountId,
        pluggyItemId: existing.pluggyItemId,
        bank: existing.bank,
        accountType: existing.accountType,
        lastSyncedAt: new Date().toISOString(),
      });
    }

    const [bank, accountType] = await Promise.all([fetchItemBankName(itemId), fetchAccountType(accountId)]);
    return this.accountRepository.upsert({
      userId,
      pluggyAccountId: accountId,
      pluggyItemId: itemId,
      bank,
      accountType,
      lastSyncedAt: new Date().toISOString(),
    });
  }

  // Idempotent: the Pluggy sync retries webhooks and the same transaction can
  // be reported more than once, so this is a no-op when it was already ingested.
  //
  // Only DEBIT (money going out) transactions are ingested — CREDIT movements
  // (salary, incoming Pix, refunds...) are not "gastos" and must never trigger
  // the categorization/Telegram question flow. Callers should skip CREDIT
  // transactions before calling this (see /api/webhook-pluggy), but this is
  // re-checked here so no caller can accidentally store one. The amount is
  // stored as a positive "spent" value so every downstream sum (goals,
  // analytics, the daily analysis job) can treat every stored row as spend.
  async execute(
    userId: string,
    itemId: string,
    accountId: string,
    transaction: PluggyTransaction,
  ): Promise<Transaction | null> {
    if (transaction.type !== 'DEBIT') return null;

    const existing = await this.transactionRepository.findByPluggyId(transaction.id);
    if (existing) return existing;

    const account = await this.ensureAccount(userId, itemId, accountId);

    return this.transactionRepository.create({
      userId,
      pluggyTransactionId: transaction.id,
      accountId: account.id,
      bank: account.bank,
      amount: Math.abs(transaction.amount),
      description: transaction.description,
      occurredAt: new Date(transaction.date).toISOString().slice(0, 10),
      category: null,
      categorySuggested: null,
      reason: null,
      status: 'pending_reason',
      telegramQuestionMessageId: null,
    });
  }
}
