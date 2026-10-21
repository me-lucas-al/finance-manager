import type { WhatsappLinkRepository } from '../domain/whatsapp-link-repository';
import type { PairingEvent, WhatsappPairing } from '../domain/whatsapp-pairing';

export class LinkWhatsappUseCase {
  constructor(
    private readonly pairing: WhatsappPairing,
    private readonly links: WhatsappLinkRepository,
  ) {}

  async *execute(userId: string, signal: AbortSignal): AsyncIterable<PairingEvent> {
    for await (const event of this.pairing.pair(userId, signal)) {
      if (event.type === 'connected') await this.links.save(userId, event.jid);
      yield event;
    }
  }
}
