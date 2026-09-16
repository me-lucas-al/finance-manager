import type { Transaction as PluggyTransaction } from 'pluggy-sdk';
import { fetchAccountInfo } from '@/lib/pluggy';
import { toBrazilDateString } from '@/lib/format';
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
        itemStatus: existing.itemStatus,
        lastSyncedAt: new Date().toISOString(),
      });
    }

    const { bank, accountType } = await fetchAccountInfo(accountId);
    return this.accountRepository.upsert({
      userId,
      pluggyAccountId: accountId,
      pluggyItemId: itemId,
      bank,
      accountType,
      itemStatus: null,
      lastSyncedAt: new Date().toISOString(),
    });
  }

  // Idempotent: the Pluggy sync retries webhooks and the same transaction can
  // be reported more than once, so this is a no-op when it was already ingested.
  //
  // Both DEBIT and CREDIT movements are ingested and asked about on Telegram —
  // the amount is stored as its absolute value so downstream sums don't need
  // to special-case sign, and `reason`/`category` capture whether it was an
  // expense or income.
  async execute(
    userId: string,
    itemId: string,
    accountId: string,
    transaction: PluggyTransaction,
  ): Promise<Transaction | null> {
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
      occurredAt: toBrazilDateString(new Date(transaction.date)),
      category: null,
      categorySuggested: null,
      reason: null,
      status: 'pending_reason',
      telegramQuestionMessageId: null,
    });
  }
}
