import { getSupabaseAdmin } from '@/lib/supabase';
import {
  Transaction,
  NewTransaction,
  TransactionFilters,
  TransactionRepository,
} from '../domain/repositories/transaction-repository';
import { Account, NewAccount, AccountRepository } from '../domain/repositories/account-repository';
import { Goal, NewGoal, GoalRepository } from '../domain/repositories/goal-repository';
import { AlertLog, NewAlertLog, AlertLogRepository } from '../domain/repositories/alert-log-repository';

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  if (data === null) throw new Error('Expected a row but got none.');
  return data;
}

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

    // Two concurrent deliveries of the same Pluggy webhook can both pass the
    // findByPluggyId check before either finishes inserting; the loser hits
    // this unique violation instead of a real error, so fetch and return the
    // row the winner created rather than failing the whole webhook.
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

  async findAllByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    let query = getSupabaseAdmin().from('transactions').select().eq('user_id', userId);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.month) {
      const [year, month] = filters.month.split('-').map(Number);
      const from = `${filters.month}-01`;
      const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`;
      query = query.gte('occurred_at', from).lt('occurred_at', nextMonth);
    }
    const { data, error } = await query.order('occurred_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as TransactionRow[]).map(toTransaction);
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

type AccountRow = {
  id: string;
  user_id: string;
  pluggy_account_id: string;
  pluggy_item_id: string;
  bank: string;
  account_type: string;
  last_synced_at: string | null;
  created_at: string;
};

function toAccount(row: AccountRow): Account {
  return {
    id: row.id,
    userId: row.user_id,
    pluggyAccountId: row.pluggy_account_id,
    pluggyItemId: row.pluggy_item_id,
    bank: row.bank,
    accountType: row.account_type,
    lastSyncedAt: row.last_synced_at,
    createdAt: row.created_at,
  };
}

export class SupabaseAccountRepository implements AccountRepository {
  async findByPluggyAccountId(pluggyAccountId: string): Promise<Account | null> {
    const { data, error } = await getSupabaseAdmin()
      .from('accounts')
      .select()
      .eq('pluggy_account_id', pluggyAccountId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toAccount(data as AccountRow) : null;
  }

  async findAllByPluggyItemId(pluggyItemId: string): Promise<Account[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('accounts')
      .select()
      .eq('pluggy_item_id', pluggyItemId);
    if (error) throw new Error(error.message);
    return (data as AccountRow[]).map(toAccount);
  }

  async upsert(data: NewAccount): Promise<Account> {
    const result = await getSupabaseAdmin()
      .from('accounts')
      .upsert(
        {
          user_id: data.userId,
          pluggy_account_id: data.pluggyAccountId,
          pluggy_item_id: data.pluggyItemId,
          bank: data.bank,
          account_type: data.accountType,
          last_synced_at: data.lastSyncedAt,
        },
        { onConflict: 'pluggy_account_id' },
      )
      .select()
      .single();
    return toAccount(unwrap<AccountRow>(result));
  }
}

type GoalRow = {
  id: string;
  user_id: string;
  month: string;
  category: string | null;
  target_amount: number;
  created_at: string;
};

function toGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    userId: row.user_id,
    month: row.month,
    category: row.category,
    targetAmount: Number(row.target_amount),
    createdAt: row.created_at,
  };
}

export class SupabaseGoalRepository implements GoalRepository {
  async findAllByUserIdAndMonth(userId: string, month: string): Promise<Goal[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('goals')
      .select()
      .eq('user_id', userId)
      .eq('month', month);
    if (error) throw new Error(error.message);
    return (data as GoalRow[]).map(toGoal);
  }

  async upsert(data: NewGoal): Promise<Goal> {
    // The uniqueness rule (one general goal + one per category, per user/month)
    // is enforced by partial unique indexes (see 0001_init.sql), which Postgres
    // can't target with a plain ON CONFLICT column list — so upsert is done as
    // an explicit find-then-write instead of relying on .upsert()'s onConflict.
    const admin = getSupabaseAdmin();
    let existing = admin.from('goals').select().eq('user_id', data.userId).eq('month', data.month);
    existing = data.category ? existing.eq('category', data.category) : existing.is('category', null);
    const { data: existingRow, error: findError } = await existing.maybeSingle();
    if (findError) throw new Error(findError.message);

    if (existingRow) {
      const result = await admin
        .from('goals')
        .update({ target_amount: data.targetAmount })
        .eq('id', (existingRow as GoalRow).id)
        .select()
        .single();
      return toGoal(unwrap<GoalRow>(result));
    }

    const result = await admin
      .from('goals')
      .insert({
        user_id: data.userId,
        month: data.month,
        category: data.category,
        target_amount: data.targetAmount,
      })
      .select()
      .single();
    return toGoal(unwrap<GoalRow>(result));
  }
}

type AlertLogRow = {
  id: string;
  alert_type: string;
  message: string;
  sent_at: string;
};

function toAlertLog(row: AlertLogRow): AlertLog {
  return { id: row.id, alertType: row.alert_type, message: row.message, sentAt: row.sent_at };
}

export class SupabaseAlertLogRepository implements AlertLogRepository {
  async findLatestByType(alertType: string): Promise<AlertLog | null> {
    const { data, error } = await getSupabaseAdmin()
      .from('alerts_log')
      .select()
      .eq('alert_type', alertType)
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toAlertLog(data as AlertLogRow) : null;
  }

  async hasSentSince(alertType: string, since: Date): Promise<boolean> {
    const { count, error } = await getSupabaseAdmin()
      .from('alerts_log')
      .select('id', { count: 'exact', head: true })
      .eq('alert_type', alertType)
      .gte('sent_at', since.toISOString());
    if (error) throw new Error(error.message);
    return (count ?? 0) > 0;
  }

  async create(data: NewAlertLog): Promise<AlertLog> {
    const result = await getSupabaseAdmin()
      .from('alerts_log')
      .insert({ alert_type: data.alertType, message: data.message })
      .select()
      .single();
    return toAlertLog(unwrap<AlertLogRow>(result));
  }
}
