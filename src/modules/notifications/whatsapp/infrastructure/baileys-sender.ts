import type { WASocket } from '@whiskeysockets/baileys';
import type { WhatsappAuthStore } from '../domain/whatsapp-auth-store';
import type { WhatsappSender } from '../domain/whatsapp-sender';
import { letDeliveryFlush, waitForOpen } from './baileys-connection';
import { openSocket } from './baileys-socket';

export class BaileysSender implements WhatsappSender {
  constructor(private readonly store: WhatsappAuthStore) {}

  async sendText(userId: string, jid: string, text: string): Promise<void> {
    await this.withOpenSocket(userId, async (socket) => {
      await socket.sendMessage(jid, { text });
      await letDeliveryFlush();
    });
  }

  async logout(userId: string): Promise<void> {
    await this.withOpenSocket(userId, (socket) => socket.logout());
  }

  private async withOpenSocket(userId: string, run: (socket: WASocket) => Promise<unknown>): Promise<void> {
    const socket = await openSocket(this.store, userId);
    try {
      await waitForOpen(socket);
      await run(socket);
    } finally {
      await socket.end(undefined);
    }
  }
}
