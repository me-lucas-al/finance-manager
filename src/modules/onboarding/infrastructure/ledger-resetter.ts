import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { expenses, financialPeriods, holdings, incomes, investments, periodSnapshots, userSettings } from '@/db/schema';
import { getSupabaseAdmin } from '@/shared/infrastructure/supabase-admin';
import { deletePluggyItem } from '@/modules/pluggy-sync/infrastructure/pluggy/pluggy-items';
import type { FinancialDataResetter } from '../application/choose-data-mode';

export class LedgerResetter implements FinancialDataResetter {
  async disconnectBanks(userId: string): Promise<void> {
    const supabase = getSupabaseAdmin();
    const { data, error: selectError } = await supabase
      .from('accounts')
      .select('pluggy_item_id')
      .eq('user_id', userId);
    if (selectError) throw new Error(`Failed to list accounts: ${selectError.message}`);
    const itemIds = new Set((data ?? []).map((row) => row.pluggy_item_id as string));

    for (const itemId of itemIds) {
      await deletePluggyItem(itemId).catch((error) => console.error(`Failed to delete Pluggy item ${itemId}:`, error));
    }
    const { error: deleteError } = await supabase.from('accounts').delete().eq('user_id', userId);
    if (deleteError) throw new Error(`Failed to delete accounts: ${deleteError.message}`);
  }

  async wipeLedger(userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(incomes).where(eq(incomes.userId, userId));
      await tx.delete(expenses).where(eq(expenses.userId, userId));
      await tx.delete(investments).where(eq(investments.userId, userId));
      await tx.delete(holdings).where(eq(holdings.userId, userId));
      await tx.update(userSettings).set({ initialBalance: '0' }).where(eq(userSettings.userId, userId));
      await tx.delete(periodSnapshots).where(eq(periodSnapshots.userId, userId));
      await tx.delete(financialPeriods).where(eq(financialPeriods.userId, userId));
    });

    const { error } = await getSupabaseAdmin().from('transactions').delete().eq('user_id', userId);
    if (error) throw new Error(`Failed to delete transactions: ${error.message}`);
  }
}
