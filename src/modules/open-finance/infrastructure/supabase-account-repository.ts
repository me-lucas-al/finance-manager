import { getSupabaseAdmin } from '@/shared/infrastructure/supabase-admin';
import { Account, ItemOwner, NewAccount, AccountRepository } from '../domain/repositories/account-repository';
import { unwrap } from './supabase-common';

type AccountRow = {
  id: string;
  user_id: string;
  pluggy_account_id: string;
  pluggy_item_id: string;
  bank: string;
  account_type: string;
  item_status: string | null;
  last_synced_at: string | null;
  balance: number | string | null;
  credit_limit: number | string | null;
  created_at: string;
};

const toNumberOrNull = (value: number | string | null): number | null => (value === null ? null : Number(value));

function balanceColumns(data: NewAccount) {
  if (data.balance === undefined) return {};
  return {
    balance: data.balance,
    credit_limit: data.creditLimit ?? null,
    balance_synced_at: new Date().toISOString(),
  };
}

function toAccount(row: AccountRow): Account {
  return {
    id: row.id,
    userId: row.user_id,
    pluggyAccountId: row.pluggy_account_id,
    pluggyItemId: row.pluggy_item_id,
    bank: row.bank,
    accountType: row.account_type,
    itemStatus: row.item_status,
    lastSyncedAt: row.last_synced_at,
    balance: toNumberOrNull(row.balance),
    creditLimit: toNumberOrNull(row.credit_limit),
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

  async findAllByUserId(userId: string): Promise<Account[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('accounts')
      .select()
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return (data as AccountRow[]).map(toAccount);
  }

  async listItemOwners(): Promise<ItemOwner[]> {
    const { data, error } = await getSupabaseAdmin().from('accounts').select('user_id, pluggy_item_id');
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({ pluggyItemId: row.pluggy_item_id as string, userId: row.user_id as string }));
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
          item_status: data.itemStatus,
          last_synced_at: data.lastSyncedAt,
          ...balanceColumns(data),
        },
        { onConflict: 'pluggy_account_id' },
      )
      .select()
      .single();
    return toAccount(unwrap<AccountRow>(result));
  }
}
