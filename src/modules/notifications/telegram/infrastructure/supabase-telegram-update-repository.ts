import { getSupabaseAdmin } from '@/lib/supabase';
import { TelegramUpdateRepository } from '../domain/telegram-update-repository';

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
}
