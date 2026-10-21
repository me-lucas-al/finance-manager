import { getSupabaseAdmin } from '@/shared/infrastructure/supabase-admin';
import type { AuthEntries, WhatsappAuthStore } from '../domain/whatsapp-auth-store';

export class SupabaseWhatsappAuthStore implements WhatsappAuthStore {
  async readMany(userId: string, names: string[]): Promise<Record<string, string>> {
    if (names.length === 0) return {};
    const { data, error } = await getSupabaseAdmin()
      .from('whatsapp_auth_keys')
      .select('name, value')
      .eq('user_id', userId)
      .in('name', names);
    if (error) throw new Error(`Failed to read WhatsApp auth keys: ${error.message}`);
    return Object.fromEntries((data ?? []).map((row) => [row.name as string, row.value as string]));
  }

  async write(userId: string, entries: AuthEntries): Promise<void> {
    const supabase = getSupabaseAdmin();
    const saved = Object.entries(entries).flatMap(([name, value]) =>
      value === null ? [] : [{ user_id: userId, name, value, updated_at: new Date().toISOString() }],
    );
    const removed = Object.keys(entries).filter((name) => entries[name] === null);
    if (saved.length > 0) {
      const { error } = await supabase.from('whatsapp_auth_keys').upsert(saved);
      if (error) throw new Error(`Failed to save WhatsApp auth keys: ${error.message}`);
    }
    if (removed.length > 0) {
      await supabase.from('whatsapp_auth_keys').delete().eq('user_id', userId).in('name', removed);
    }
  }

  async clear(userId: string): Promise<void> {
    await getSupabaseAdmin().from('whatsapp_auth_keys').delete().eq('user_id', userId);
  }
}
