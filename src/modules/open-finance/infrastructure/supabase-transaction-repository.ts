import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  Transaction,
  NewTransaction,
  TransactionFilters,
  TransactionRepository,
} from '../domain/repositories/transaction-repository';
import { unwrap } from './supabase-common';

type TransactionsQuery = ReturnType<ReturnType<SupabaseClient['from']>['select']>;

type TransactionRow = {
  id: string;
  user_id: string;
  pluggy_transaction_id: string;
  account_id: string | null;
  bank: string;
  amount: number;
  description: string;
  occurred_at: string;
  category: string | null;
  category_suggested: string | null;
  reason: string | null;
  status: Transaction['status'];
  telegram_question_message_id: number | null;
  created_at: string;
};

const SORT_COLUMN: Record<NonNullable<TransactionFilters['sort']>, string> = {
  date: 'occurred_at',
  description: 'description',
  amount: 'amount',
};

function applyFilters(
  query: TransactionsQuery,
  userId: string,
  filters?: Pick<TransactionFilters, 'month' | 'category' | 'search'>
): TransactionsQuery {
  let result = query.eq('user_id', userId);
  if (filters?.category) result = result.eq('category', filters.category);
  if (filters?.search) result = result.ilike('description', `%${filters.search}%`);
  if (filters?.month) {
    const [year, month] = filters.month.split('-').map(Number);
    const from = `${filters.month}-01`;
    const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`;
    result = result.gte('occurred_at', from).lt('occurred_at', nextMonth);
  }
  return result;
}

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    pluggyTransactionId: row.pluggy_transaction_id,
    accountId: row.account_id,
    bank: row.bank,
    amount: Number(row.amount),
    description: row.description,
    occurredAt: row.occurred_at,
    category: row.category,
    categorySuggested: row.category_suggested,
    reason: row.reason,
    status: row.status,
    telegramQuestionMessageId: row.telegram_question_message_id,
    createdAt: row.created_at,
  };
}

export class SupabaseTransactionRepository implements TransactionRepository {
  async create(data: NewTransaction): Promise<Transaction> {
    const result = await getSupabaseAdmin()
      .from('transactions')
      .insert({
        user_id: data.userId,
        pluggy_transaction_id: data.pluggyTransactionId,
        account_id: data.accountId,
        bank: data.bank,
        amount: data.amount,
        description: data.description,
        occurred_at: data.occurredAt,
        category: data.category,
        category_suggested: data.categorySuggested,
        reason: data.reason,
        status: data.status,
        telegram_question_message_id: data.telegramQuestionMessageId,
      })
      .select()
      .single();

    if (result.error?.code === '23505') {
      const existing = await this.findByPluggyId(data.pluggyTransactionId);
      if (existing) return existing;
    }

    return toTransaction(unwrap<TransactionRow>(result));
  }

  async findById(id: string): Promise<Transaction | null> {
    const { data, error } = await getSupabaseAdmin().from('transactions').select().eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toTransaction(data as TransactionRow) : null;
  }

  async findByPluggyId(pluggyTransactionId: string): Promise<Transaction | null> {
    const { data, error } = await getSupabaseAdmin()
      .from('transactions')
      .select()
      .eq('pluggy_transaction_id', pluggyTransactionId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toTransaction(data as TransactionRow) : null;
  }

  async findByTelegramQuestionMessageId(messageId: number): Promise<Transaction | null> {
    const { data, error } = await getSupabaseAdmin()
      .from('transactions')
      .select()
      .eq('telegram_question_message_id', messageId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toTransaction(data as TransactionRow) : null;
  }

  async findLatestPendingByUserId(userId: string): Promise<Transaction | null> {
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

  async findAllByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
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

  async countByUserId(
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

  async update(
    id: string,
    data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>,
  ): Promise<Transaction> {
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
    if (data.telegramQuestionMessageId !== undefined) {
      patch.telegram_question_message_id = data.telegramQuestionMessageId;
    }

    const result = await getSupabaseAdmin().from('transactions').update(patch).eq('id', id).select().single();
    return toTransaction(unwrap<TransactionRow>(result));
  }
}
