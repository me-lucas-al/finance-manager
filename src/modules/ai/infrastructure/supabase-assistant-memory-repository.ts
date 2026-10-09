import { getSupabaseAdmin } from '@/lib/supabase';
import {
  AssistantMemory,
  NewAssistantMemory,
  AssistantMemoryRepository,
} from '../domain/repositories/assistant-memory-repository';

type AssistantMemoryRow = {
  id: string;
  user_id: string;
  fact: string;
  created_at: string;
};

function toAssistantMemory(row: AssistantMemoryRow): AssistantMemory {
  return {
    id: row.id,
    userId: row.user_id,
    fact: row.fact,
    createdAt: row.created_at,
  };
}

export class SupabaseAssistantMemoryRepository implements AssistantMemoryRepository {
  async create(data: NewAssistantMemory): Promise<AssistantMemory> {
    const { data: row, error } = await getSupabaseAdmin()
      .from('assistant_memory')
      .insert({
        user_id: data.userId,
        fact: data.fact,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    await this.trimOldest(data.userId, 50);
    return toAssistantMemory(row as AssistantMemoryRow);
  }

  async findAllByUserId(userId: string): Promise<AssistantMemory[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('assistant_memory')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data as AssistantMemoryRow[]).map(toAssistantMemory);
  }

  async trimOldest(userId: string, maxItems: number = 50): Promise<void> {
    const { data, error } = await getSupabaseAdmin()
      .from('assistant_memory')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return;
    if (data.length <= maxItems) return;

    const idsToRemove = data.slice(maxItems).map((item) => item.id);
    await getSupabaseAdmin().from('assistant_memory').delete().in('id', idsToRemove);
  }
}
