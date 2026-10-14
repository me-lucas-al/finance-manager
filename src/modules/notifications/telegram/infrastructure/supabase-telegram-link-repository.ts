import { randomInt } from 'node:crypto';
import { getSupabaseAdmin } from '@/lib/supabase';

const CODE_TTL_MS = 15 * 60 * 1000;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode(): string {
  let code = '';
  for (let i = 0; i < 8; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

export class SupabaseTelegramLinkRepository {
  async findChatIdByUserId(userId: string): Promise<number | null> {
    const { data } = await getSupabaseAdmin()
      .from('telegram_links')
      .select('chat_id')
      .eq('user_id', userId)
      .maybeSingle();
    return data ? Number(data.chat_id) : null;
  }

  async findUserIdByChatId(chatId: number): Promise<string | null> {
    const { data } = await getSupabaseAdmin()
      .from('telegram_links')
      .select('user_id')
      .eq('chat_id', chatId)
      .maybeSingle();
    return data?.user_id ?? null;
  }

  async listLinkedUserIds(): Promise<string[]> {
    const { data } = await getSupabaseAdmin().from('telegram_links').select('user_id');
    return (data ?? []).map((row) => row.user_id as string);
  }

  async createLinkCode(userId: string): Promise<string> {
    const supabase = getSupabaseAdmin();
    await supabase.from('telegram_link_codes').delete().eq('user_id', userId);
    const code = generateCode();
    const { error } = await supabase.from('telegram_link_codes').insert({
      code,
      user_id: userId,
      expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
    });
    if (error) throw new Error(`Failed to create Telegram link code: ${error.message}`);
    return code;
  }

  async consumeLinkCode(code: string, chatId: number): Promise<string | null> {
    const { data, error } = await getSupabaseAdmin().rpc('consume_telegram_link_code', {
      p_code: code,
      p_chat_id: chatId,
    });
    if (error) throw new Error(`Failed to link Telegram chat: ${error.message}`);
    return (data as string | null) ?? null;
  }

  async unlink(userId: string): Promise<void> {
    await getSupabaseAdmin().from('telegram_links').delete().eq('user_id', userId);
  }
}
