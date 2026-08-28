import { getSupabaseAdmin } from '@/lib/supabase';
import { Account, NewAccount, AccountRepository } from '../domain/repositories/account-repository';
import { unwrap } from './supabase-common';

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
