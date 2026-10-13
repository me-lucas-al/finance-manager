import { and, eq, isNotNull } from 'drizzle-orm';
import { db } from '@/db';
import { incomes } from '@/db/schema';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { EntryRef } from '../domain/models/entry-changes';
import type { FixedLaunchLookup } from '../domain/ports/fixed-launch-lookup';

type LaunchedRow = { fixed_entry_id: string };
type LaunchedId = { id: string };

export class PersistenceFixedLaunchLookup implements FixedLaunchLookup {
  async findLaunchedRuleIds(userId: string, month: string): Promise<Set<string>> {
    const [expenses, incomeRows] = await Promise.all([
      this.findLaunchedExpenseRuleIds(userId, month),
      db
        .select({ fixedEntryId: incomes.fixedEntryId })
        .from(incomes)
        .where(
          and(eq(incomes.userId, userId), eq(incomes.fixedReferenceMonth, month), isNotNull(incomes.fixedEntryId))
        ),
    ]);
    return new Set([...expenses, ...incomeRows.flatMap((row) => (row.fixedEntryId ? [row.fixedEntryId] : []))]);
  }

  async findLaunch(fixedEntryId: string, month: string): Promise<EntryRef | null> {
    const expenseId = await this.findExpenseLaunchId(fixedEntryId, month);
    if (expenseId) return { kind: 'expense', id: expenseId };
    const [income] = await db
      .select({ id: incomes.id })
      .from(incomes)
      .where(and(eq(incomes.fixedEntryId, fixedEntryId), eq(incomes.fixedReferenceMonth, month)))
      .limit(1);
    return income ? { kind: 'income', id: income.id } : null;
  }

  private async findLaunchedExpenseRuleIds(userId: string, month: string): Promise<string[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('transactions')
      .select('fixed_entry_id')
      .eq('user_id', userId)
      .eq('fixed_reference_month', month)
      .not('fixed_entry_id', 'is', null);
    if (error) throw new Error(error.message);
    return ((data ?? []) as LaunchedRow[]).map((row) => row.fixed_entry_id);
  }

  private async findExpenseLaunchId(fixedEntryId: string, month: string): Promise<string | null> {
    const { data, error } = await getSupabaseAdmin()
      .from('transactions')
      .select('id')
      .eq('fixed_entry_id', fixedEntryId)
      .eq('fixed_reference_month', month)
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? (data as LaunchedId).id : null;
  }
}
