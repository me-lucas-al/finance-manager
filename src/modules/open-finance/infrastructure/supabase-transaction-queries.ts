import { getSupabaseAdmin } from '@/lib/supabase';
import { Transaction, TransactionFilters } from '../domain/repositories/transaction-repository';
import {
  TransactionRow,
  SORT_COLUMN,
  applyFilters,
  toTransaction,
} from './transaction-row-mapper';

export async function fetchTransactionById(id: string): Promise<Transaction | null> {
  const { data, error } = await getSupabaseAdmin().from('transactions').select().eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toTransaction(data as TransactionRow) : null;
}

export async function fetchTransactionByPluggyId(pluggyId: string): Promise<Transaction | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('transactions')
    .select()
    .eq('pluggy_transaction_id', pluggyId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toTransaction(data as TransactionRow) : null;
}

export async function fetchTransactionByTelegramMessageId(messageId: number): Promise<Transaction | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('transactions')
    .select()
    .eq('telegram_question_message_id', messageId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toTransaction(data as TransactionRow) : null;
}

export async function fetchLatestPendingTransaction(userId: string): Promise<Transaction | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('transactions')
    .select()
    .eq('user_id', userId)
    .eq('status', 'pending_reason')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toTransaction(data as TransactionRow) : null;
}

export async function fetchLatestTransaction(userId: string): Promise<Transaction | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('transactions')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toTransaction(data as TransactionRow) : null;
}

export async function fetchTransactionsList(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
  let query = applyFilters(getSupabaseAdmin().from('transactions').select(), userId, filters);
  const sortColumn = filters?.sort ? SORT_COLUMN[filters.sort] : SORT_COLUMN.date;
  query = query.order(sortColumn, { ascending: filters?.dir === 'asc' });
  if (filters?.limit !== undefined && filters?.offset !== undefined) {
    query = query.range(filters.offset, filters.offset + filters.limit - 1);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as TransactionRow[]).map(toTransaction);
}

export async function fetchTransactionsCount(
  userId: string,
  filters?: Pick<TransactionFilters, 'month' | 'category' | 'search'>
): Promise<number> {
  const query = applyFilters(
    getSupabaseAdmin().from('transactions').select('*', { count: 'exact', head: true }),
    userId,
    filters
  );
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}
