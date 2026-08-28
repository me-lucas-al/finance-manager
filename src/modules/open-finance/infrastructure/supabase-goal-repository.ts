import { getSupabaseAdmin } from '@/lib/supabase';
import { Goal, NewGoal, GoalRepository } from '../domain/repositories/goal-repository';
import { unwrap } from './supabase-common';

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
