import type { WhatsappAuthStore } from '../domain/whatsapp-auth-store';
import type { WhatsappLinkRepository } from '../domain/whatsapp-link-repository';
import type { WhatsappSender } from '../domain/whatsapp-sender';

export class UnlinkWhatsappUseCase {
  constructor(
    private readonly links: WhatsappLinkRepository,
    private readonly sender: WhatsappSender,
    private readonly authStore: WhatsappAuthStore,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.sender.logout(userId).catch((error) => console.warn('WhatsApp logout skipped:', error));
    await this.authStore.clear(userId);
    await this.links.remove(userId);
  }
}
