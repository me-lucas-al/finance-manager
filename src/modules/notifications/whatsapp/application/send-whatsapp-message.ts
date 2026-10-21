import type { WhatsappAuthStore } from '../domain/whatsapp-auth-store';
import type { WhatsappLinkRepository } from '../domain/whatsapp-link-repository';
import type { WhatsappMessenger } from '../domain/whatsapp-messenger';
import { WhatsappLoggedOutError, type WhatsappSender } from '../domain/whatsapp-sender';

export class SendWhatsappMessageUseCase implements WhatsappMessenger {
  constructor(
    private readonly links: WhatsappLinkRepository,
    private readonly sender: WhatsappSender,
    private readonly authStore: WhatsappAuthStore,
  ) {}

  async sendMessage(userId: string, text: string): Promise<boolean> {
    const link = await this.links.findByUserId(userId);
    if (!link) return false;
    try {
      await this.sender.sendText(userId, link.jid, text);
      return true;
    } catch (error) {
      if (error instanceof WhatsappLoggedOutError) await this.forget(userId);
      console.error(`WhatsApp message failed for user ${userId}:`, error);
      return false;
    }
  }

  private async forget(userId: string): Promise<void> {
    await this.authStore.clear(userId);
    await this.links.remove(userId);
  }
}
