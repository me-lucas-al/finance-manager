import { getSupabaseAdmin } from '@/shared/infrastructure/supabase-admin';
import {
  Transaction,
  NewTransaction,
  TransactionFilters,
  TransactionRepository,
} from '../domain/repositories/transaction-repository';
import { unwrap } from './supabase-common';
import { buildTransactionInsert } from './transaction-insert-mapper';
import { DuplicateFixedLaunchError } from '@/modules/finance/domain/models/fixed-launch-errors';
import {
  TransactionRow,
  toTransaction,
  buildTransactionPatch,
} from './transaction-row-mapper';
import {
  fetchTransactionById,
  fetchTransactionByPluggyId,
  fetchTransactionByTelegramMessageId,
  fetchLatestPendingTransaction,
  fetchLatestTransaction,
  fetchTransactionsList,
  fetchTransactionsCount,
} from './supabase-transaction-queries';

export class SupabaseTransactionRepository implements TransactionRepository {
  async create(data: NewTransaction): Promise<Transaction> {
    const result = await getSupabaseAdmin()
      .from('transactions')
      .insert(buildTransactionInsert(data))
      .select()
      .single();

    if (result.error?.code === '23505' && data.fixedEntryId) throw new DuplicateFixedLaunchError();

    if (result.error?.code === '23505' && data.pluggyTransactionId) {
      const existing = await this.findByPluggyId(data.pluggyTransactionId);
      if (existing) return existing;
    }

    return toTransaction(unwrap<TransactionRow>(result));
  }

  async findById(id: string): Promise<Transaction | null> {
    return fetchTransactionById(id);
  }

  async findByPluggyId(pluggyTransactionId: string): Promise<Transaction | null> {
    return fetchTransactionByPluggyId(pluggyTransactionId);
  }

  async findByTelegramQuestionMessageId(userId: string, messageId: number): Promise<Transaction | null> {
    return fetchTransactionByTelegramMessageId(userId, messageId);
  }

  async findLatestPendingByUserId(userId: string): Promise<Transaction | null> {
    return fetchLatestPendingTransaction(userId);
  }

  async findLatestByUserId(userId: string): Promise<Transaction | null> {
    return fetchLatestTransaction(userId);
  }

  async findAllByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    return fetchTransactionsList(userId, filters);
  }

  async countByUserId(
    userId: string,
    filters?: Pick<TransactionFilters, 'month' | 'category' | 'search'>
  ): Promise<number> {
    return fetchTransactionsCount(userId, filters);
  }

  async update(
    id: string,
    data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>,
  ): Promise<Transaction> {
    const patch = buildTransactionPatch(data);
    const result = await getSupabaseAdmin().from('transactions').update(patch).eq('id', id).select().single();
    return toTransaction(unwrap<TransactionRow>(result));
  }

  async delete(id: string): Promise<void> {
    const { error } = await getSupabaseAdmin().from('transactions').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}
