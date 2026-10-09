import { getSupabaseAdmin } from '@/lib/supabase';
import {
  ChatMessage,
  NewChatMessage,
  ChatMessageRepository,
} from '../domain/repositories/chat-message-repository';

type ChatMessageRow = {
  id: string;
  user_id: string;
  role: ChatMessage['role'];
  content: string;
  created_at: string;
};

function toChatMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    userId: row.user_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  };
}

export class SupabaseChatMessageRepository implements ChatMessageRepository {
  async create(data: NewChatMessage): Promise<ChatMessage> {
    const { data: row, error } = await getSupabaseAdmin()
      .from('chat_messages')
      .insert({
        user_id: data.userId,
        role: data.role,
        content: data.content,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toChatMessage(row as ChatMessageRow);
  }

  async findRecentByUserId(userId: string, limit: number = 12): Promise<ChatMessage[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('chat_messages')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    const rows = (data as ChatMessageRow[]).reverse();
    return rows.map(toChatMessage);
  }

  async deleteByIds(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const { error } = await getSupabaseAdmin().from('chat_messages').delete().in('id', ids);
    if (error) throw new Error(error.message);
  }

  async countByUserId(userId: string): Promise<number> {
    const { count, error } = await getSupabaseAdmin()
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return count ?? 0;
  }
}
