import type { Transaction as PluggyTransaction } from 'pluggy-sdk';
import { fetchAccountType, fetchItemBankName } from '@/lib/pluggy';
import {
  SupabaseAccountRepository,
  SupabaseTransactionRepository,
} from '../../infrastructure/supabase-repositories';
import type { Transaction } from '../../domain/repositories/transaction-repository';

const accountRepository = new SupabaseAccountRepository();
const transactionRepository = new SupabaseTransactionRepository();

async function ensureAccount(userId: string, itemId: string, accountId: string) {
  const existing = await accountRepository.findByPluggyAccountId(accountId);
  if (existing) return existing;

  const [bank, accountType] = await Promise.all([fetchItemBankName(itemId), fetchAccountType(accountId)]);
  return accountRepository.upsert({
    userId,
    pluggyAccountId: accountId,
    pluggyItemId: itemId,
    bank,
    accountType,
    lastSyncedAt: new Date().toISOString(),
  });
}

// Idempotent: the Pluggy sync retries webhooks and the same transaction can be
// reported more than once, so this is a no-op when it was already ingested.
//
// Only DEBIT (money going out) transactions are ingested — CREDIT movements
// (salary, incoming Pix, refunds...) are not "gastos" and must never trigger
// the categorization/Telegram question flow. Callers should skip CREDIT
// transactions before calling this (see /api/webhook-pluggy), but this is
// re-checked here so no caller can accidentally store one. The amount is
// stored as a positive "spent" value so every downstream sum (goals,
// analytics, the daily analysis job) can treat every stored row as spend.
export async function ingestPluggyTransaction(
  userId: string,
  itemId: string,
  accountId: string,
  transaction: PluggyTransaction,
): Promise<Transaction | null> {
  if (transaction.type !== 'DEBIT') return null;

  const existing = await transactionRepository.findByPluggyId(transaction.id);
  if (existing) return existing;

  const account = await ensureAccount(userId, itemId, accountId);

  return transactionRepository.create({
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
