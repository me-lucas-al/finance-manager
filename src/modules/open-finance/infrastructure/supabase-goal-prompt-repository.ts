import { getSupabaseAdmin } from '@/lib/supabase';
import { GoalPrompt, NewGoalPrompt, GoalPromptRepository } from '../domain/repositories/goal-prompt-repository';
import { unwrap } from './supabase-common';

type GoalPromptRow = {
  id: string;
  user_id: string;
  telegram_message_id: number;
  answered_at: string | null;
  created_at: string;
};

function toGoalPrompt(row: GoalPromptRow): GoalPrompt {
  return {
    id: row.id,
    userId: row.user_id,
    telegramMessageId: row.telegram_message_id,
    answeredAt: row.answered_at,
    createdAt: row.created_at,
  };
}

export class SupabaseGoalPromptRepository implements GoalPromptRepository {
  async create(data: NewGoalPrompt): Promise<GoalPrompt> {
    const result = await getSupabaseAdmin()
      .from('goal_prompts')
      .insert({ user_id: data.userId, telegram_message_id: data.telegramMessageId })
      .select()
      .single();
    return toGoalPrompt(unwrap<GoalPromptRow>(result));
  }

  async findByTelegramMessageId(messageId: number): Promise<GoalPrompt | null> {
    const { data, error } = await getSupabaseAdmin()
      .from('goal_prompts')
      .select()
      .eq('telegram_message_id', messageId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toGoalPrompt(data as GoalPromptRow) : null;
  }

  async findLatestPendingByUserId(userId: string): Promise<GoalPrompt | null> {
    const { data, error } = await getSupabaseAdmin()
      .from('goal_prompts')
      .select()
      .eq('user_id', userId)
      .is('answered_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toGoalPrompt(data as GoalPromptRow) : null;
  }

  async markAnswered(id: string): Promise<GoalPrompt> {
    const result = await getSupabaseAdmin()
      .from('goal_prompts')
      .update({ answered_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return toGoalPrompt(unwrap<GoalPromptRow>(result));
  }
}
