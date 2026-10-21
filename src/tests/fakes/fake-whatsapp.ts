import type { AuthEntries, WhatsappAuthStore } from '@/modules/notifications/whatsapp/domain/whatsapp-auth-store';
import type { WhatsappLink, WhatsappLinkRepository } from '@/modules/notifications/whatsapp/domain/whatsapp-link-repository';
import type { PairingEvent, WhatsappPairing } from '@/modules/notifications/whatsapp/domain/whatsapp-pairing';
import type { WhatsappSender } from '@/modules/notifications/whatsapp/domain/whatsapp-sender';

export class FakeWhatsappLinkRepository implements WhatsappLinkRepository {
  public links = new Map<string, WhatsappLink>();

  async findByUserId(userId: string) {
    return this.links.get(userId) ?? null;
  }

  async save(userId: string, jid: string) {
    this.links.set(userId, { userId, jid, linkedAt: new Date().toISOString() });
  }

  async remove(userId: string) {
    this.links.delete(userId);
  }
}

export class FakeWhatsappAuthStore implements WhatsappAuthStore {
  public entries = new Map<string, string>();

  async readMany(userId: string, names: string[]) {
    const found = names.filter((name) => this.entries.has(`${userId}:${name}`));
    return Object.fromEntries(found.map((name) => [name, this.entries.get(`${userId}:${name}`)!]));
  }

  async write(userId: string, entries: AuthEntries) {
    for (const [name, value] of Object.entries(entries)) {
      if (value === null) this.entries.delete(`${userId}:${name}`);
      else this.entries.set(`${userId}:${name}`, value);
    }
  }

  async clear(userId: string) {
    for (const key of [...this.entries.keys()]) if (key.startsWith(`${userId}:`)) this.entries.delete(key);
  }
}

export class FakeWhatsappSender implements WhatsappSender {
  public sent: Array<{ userId: string; jid: string; text: string }> = [];
  public failWith: Error | null = null;
  public loggedOut: string[] = [];

  async sendText(userId: string, jid: string, text: string) {
    if (this.failWith) throw this.failWith;
    this.sent.push({ userId, jid, text });
  }

  async logout(userId: string) {
    this.loggedOut.push(userId);
  }
}

export class FakeWhatsappPairing implements WhatsappPairing {
  constructor(private readonly events: PairingEvent[]) {}

  async *pair() {
    yield* this.events;
  }
}
