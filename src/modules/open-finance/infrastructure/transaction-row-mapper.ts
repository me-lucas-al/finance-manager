import type { SupabaseClient } from '@supabase/supabase-js';
import {
  Transaction,
  TransactionFilters,
} from '../domain/repositories/transaction-repository';

export type TransactionsQuery = ReturnType<ReturnType<SupabaseClient['from']>['select']>;

export type TransactionRow = {
  id: string;
  user_id: string;
  pluggy_transaction_id: string | null;
  account_id: string | null;
  bank: string;
  amount: number;
  description: string;
  occurred_at: string;
  category: string | null;
  category_suggested: string | null;
  reason: string | null;
  status: Transaction['status'];
  source: Transaction['source'];
  necessity: Transaction['necessity'];
  telegram_question_message_id: number | null;
  created_at: string;
};

export const SORT_COLUMN: Record<NonNullable<TransactionFilters['sort']>, string> = {
  date: 'occurred_at',
  description: 'description',
  amount: 'amount',
};

export function applyFilters(
  query: TransactionsQuery,
  userId: string,
  filters?: Pick<TransactionFilters, 'month' | 'dateFrom' | 'dateTo' | 'category' | 'search' | 'source'>
): TransactionsQuery {
  let result = query.eq('user_id', userId);
  if (filters?.source) result = result.eq('source', filters.source);
  if (filters?.category) result = result.eq('category', filters.category);
  if (filters?.search) result = result.ilike('description', `%${filters.search}%`);
  if (filters?.month) {
    const [year, month] = filters.month.split('-').map(Number);
    const from = `${filters.month}-01`;
    const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`;
    result = result.gte('occurred_at', from).lt('occurred_at', nextMonth);
  }
  if (filters?.dateFrom) result = result.gte('occurred_at', filters.dateFrom.toISOString().slice(0, 10));
  if (filters?.dateTo) result = result.lte('occurred_at', filters.dateTo.toISOString().slice(0, 10));
  return result;
}

export function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    pluggyTransactionId: row.pluggy_transaction_id,
    accountId: row.account_id,
    bank: row.bank ?? 'Manual',
    amount: Number(row.amount),
    description: row.description,
    occurredAt: row.occurred_at,
    category: row.category,
    categorySuggested: row.category_suggested,
    reason: row.reason,
    status: row.status,
    source: row.source ?? 'manual',
    necessity: row.necessity ?? null,
    telegramQuestionMessageId: row.telegram_question_message_id,
    createdAt: row.created_at,
  };
}

export function buildTransactionPatch(
  data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  if (data.pluggyTransactionId !== undefined) patch.pluggy_transaction_id = data.pluggyTransactionId;
  if (data.accountId !== undefined) patch.account_id = data.accountId;
  if (data.bank !== undefined) patch.bank = data.bank;
  if (data.amount !== undefined) patch.amount = data.amount;
  if (data.description !== undefined) patch.description = data.description;
  if (data.occurredAt !== undefined) patch.occurred_at = data.occurredAt;
  if (data.category !== undefined) patch.category = data.category;
  if (data.categorySuggested !== undefined) patch.category_suggested = data.categorySuggested;
  if (data.reason !== undefined) patch.reason = data.reason;
  if (data.status !== undefined) patch.status = data.status;
  if (data.source !== undefined) patch.source = data.source;
  if (data.necessity !== undefined) patch.necessity = data.necessity;
  if (data.telegramQuestionMessageId !== undefined) patch.telegram_question_message_id = data.telegramQuestionMessageId;
  return patch;
}
