import { getSupabaseAdmin } from '@/shared/infrastructure/supabase-admin';
import type { WhatsappLink, WhatsappLinkRepository } from '../domain/whatsapp-link-repository';

export class SupabaseWhatsappLinkRepository implements WhatsappLinkRepository {
  async findByUserId(userId: string): Promise<WhatsappLink | null> {
    const { data } = await getSupabaseAdmin()
      .from('whatsapp_links')
      .select('user_id, jid, linked_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (!data) return null;
    return { userId: data.user_id, jid: data.jid, linkedAt: data.linked_at };
  }

  async save(userId: string, jid: string): Promise<void> {
    const { error } = await getSupabaseAdmin()
      .from('whatsapp_links')
      .upsert({ user_id: userId, jid, linked_at: new Date().toISOString() });
    if (error) throw new Error(`Failed to save WhatsApp link: ${error.message}`);
  }

  async remove(userId: string): Promise<void> {
    await getSupabaseAdmin().from('whatsapp_links').delete().eq('user_id', userId);
  }
}
