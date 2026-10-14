import { getSupabaseAdmin } from '@/shared/infrastructure/supabase-admin';
import { TelegramUpdateRepository } from '../domain/telegram-update-repository';

const UNIQUE_VIOLATION = '23505';

export class SupabaseTelegramUpdateRepository implements TelegramUpdateRepository {
  async isProcessed(updateId: number): Promise<boolean> {
    const { data } = await getSupabaseAdmin()
      .from('telegram_updates')
      .select('update_id')
      .eq('update_id', updateId)
      .maybeSingle();

    return !!data;
  }

  async markProcessed(updateId: number): Promise<void> {
    await getSupabaseAdmin()
      .from('telegram_updates')
      .insert({ update_id: updateId });
  }

  async claim(updateId: number): Promise<boolean> {
    const { error } = await getSupabaseAdmin().from('telegram_updates').insert({ update_id: updateId });
    if (!error) return true;
    if (error.code === UNIQUE_VIOLATION) return false;
    throw new Error(`Failed to claim Telegram update: ${error.message}`);
  }

}
