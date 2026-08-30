import { getSupabaseAdmin } from '@/lib/supabase';
import {
  SavingsGoal,
  NewSavingsGoal,
  SavingsGoalRepository,
} from '../domain/repositories/savings-goal-repository';
import { unwrap } from './supabase-common';

type SavingsGoalRow = {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  status: SavingsGoal['status'];
  created_at: string;
  updated_at: string;
};

function toSavingsGoal(row: SavingsGoalRow): SavingsGoal {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    targetDate: row.target_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseSavingsGoalRepository implements SavingsGoalRepository {
  async findAllActiveByUserId(userId: string): Promise<SavingsGoal[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('savings_goals')
      .select()
      .eq('user_id', userId)
      .eq('status', 'active');
    if (error) throw new Error(error.message);
    return (data as SavingsGoalRow[]).map(toSavingsGoal);
  }

  async create(data: NewSavingsGoal): Promise<SavingsGoal> {
    const result = await getSupabaseAdmin()
      .from('savings_goals')
      .insert({
        user_id: data.userId,
        title: data.title,
        target_amount: data.targetAmount,
        current_amount: data.currentAmount ?? 0,
        target_date: data.targetDate,
        status: data.status ?? 'active',
      })
      .select()
      .single();
    return toSavingsGoal(unwrap<SavingsGoalRow>(result));
  }

  async update(
    id: string,
    patch: Partial<Omit<SavingsGoal, 'id' | 'userId' | 'createdAt'>>,
  ): Promise<SavingsGoal> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.title !== undefined) update.title = patch.title;
    if (patch.targetAmount !== undefined) update.target_amount = patch.targetAmount;
    if (patch.currentAmount !== undefined) update.current_amount = patch.currentAmount;
    if (patch.targetDate !== undefined) update.target_date = patch.targetDate;
    if (patch.status !== undefined) update.status = patch.status;

    const result = await getSupabaseAdmin()
      .from('savings_goals')
      .update(update)
      .eq('id', id)
      .select()
      .single();
    return toSavingsGoal(unwrap<SavingsGoalRow>(result));
  }
}
