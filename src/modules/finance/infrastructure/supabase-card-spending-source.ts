import { getSupabaseAdmin } from '@/shared/infrastructure/supabase-admin';
import type { CardExpense } from '../domain/models/credit-card';
import type { CardSpendingSource, DateRange } from '../domain/ports/card-spending-source';

type CardExpenseRow = { credit_card_id: string; amount: number | string; occurred_at: string };

export class SupabaseCardSpendingSource implements CardSpendingSource {
  async listCardExpenses(userId: string, range: DateRange): Promise<CardExpense[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('transactions')
      .select('credit_card_id, amount, occurred_at')
      .eq('user_id', userId)
      .eq('source', 'manual')
      .not('credit_card_id', 'is', null)
      .gte('occurred_at', range.from)
      .lte('occurred_at', range.to);
    if (error) throw new Error(error.message);
    return ((data ?? []) as CardExpenseRow[]).map((row) => ({
      creditCardId: row.credit_card_id,
      amount: Number(row.amount),
      date: row.occurred_at.slice(0, 10),
    }));
  }
}
