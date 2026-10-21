import { getSupabaseAdmin } from '@/shared/infrastructure/supabase-admin';
import type { AuthEntries, WhatsappAuthStore } from '../domain/whatsapp-auth-store';

const TABLE = 'whatsapp_auth_keys';

export class SupabaseWhatsappAuthStore implements WhatsappAuthStore {
  async readMany(userId: string, names: string[]): Promise<Record<string, string>> {
    if (names.length === 0) return {};
    const { data, error } = await getSupabaseAdmin()
      .from(TABLE)
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
      const { error } = await supabase.from(TABLE).upsert(saved);
      if (error) throw new Error(`Failed to save WhatsApp auth keys: ${error.message}`);
    }
    if (removed.length === 0) return;
    const { error } = await supabase.from(TABLE).delete().eq('user_id', userId).in('name', removed);
    if (error) throw new Error(`Failed to delete WhatsApp auth keys: ${error.message}`);
  }

  async clear(userId: string): Promise<void> {
    const { error } = await getSupabaseAdmin().from(TABLE).delete().eq('user_id', userId);
    if (error) throw new Error(`Failed to clear WhatsApp auth keys: ${error.message}`);
  }
}
