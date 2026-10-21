import type { WhatsappLinkRepository } from '../domain/whatsapp-link-repository';

export class GetWhatsappStatusUseCase {
  constructor(private readonly links: WhatsappLinkRepository) {}

  async execute(userId: string): Promise<{ connected: boolean }> {
    return { connected: (await this.links.findByUserId(userId)) !== null };
  }
}
