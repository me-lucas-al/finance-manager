export type WhatsappLink = { userId: string; jid: string; linkedAt: string };

export interface WhatsappLinkRepository {
  findByUserId(userId: string): Promise<WhatsappLink | null>;
  save(userId: string, jid: string): Promise<void>;
  remove(userId: string): Promise<void>;
}
