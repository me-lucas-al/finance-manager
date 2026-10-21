import type { WhatsappAuthStore } from '../domain/whatsapp-auth-store';
import type { WhatsappLinkRepository } from '../domain/whatsapp-link-repository';
import type { PairingEvent, WhatsappPairing } from '../domain/whatsapp-pairing';

const ALREADY_PAIRING: PairingEvent = { type: 'failed', reason: 'Já existe uma conexão em andamento. Feche a outra aba e tente de novo.' };

export class LinkWhatsappUseCase {
  private readonly pairing = new Set<string>();

  constructor(
    private readonly pairer: WhatsappPairing,
    private readonly links: WhatsappLinkRepository,
    private readonly authStore: WhatsappAuthStore,
  ) {}

  async *execute(userId: string, signal: AbortSignal): AsyncIterable<PairingEvent> {
    if (this.pairing.has(userId)) {
      yield ALREADY_PAIRING;
      return;
    }
    this.pairing.add(userId);
    let linked = false;
    try {
      for await (const event of this.pairer.pair(userId, signal)) {
        if (event.type === 'connected') {
          await this.links.save(userId, event.jid);
          linked = true;
        }
        yield event;
      }
    } finally {
      this.pairing.delete(userId);
      if (!linked) await this.discardUnlinkedSession(userId);
    }
  }

  private async discardUnlinkedSession(userId: string): Promise<void> {
    if (await this.links.findByUserId(userId)) return;
    await this.authStore.clear(userId);
  }
}
