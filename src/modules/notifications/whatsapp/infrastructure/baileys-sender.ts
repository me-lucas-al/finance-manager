import type { KeyedMutex } from '@/shared/infrastructure/keyed-mutex';
import type { WhatsappAuthStore } from '../domain/whatsapp-auth-store';
import { WhatsappLoggedOutError, type WhatsappSender } from '../domain/whatsapp-sender';
import { letDeliveryFlush, waitForOpen } from './baileys-connection';
import { openSocket, type OpenedSocket, type SocketOpener } from './baileys-socket';
import { sessionLock } from './session-lock';

export class BaileysSender implements WhatsappSender {
  constructor(
    private readonly store: WhatsappAuthStore,
    private readonly open: SocketOpener = openSocket,
    private readonly lock: KeyedMutex = sessionLock,
  ) {}

  async sendText(userId: string, jid: string, text: string): Promise<void> {
    await this.withOpenSocket(userId, async ({ socket }) => {
      await socket.sendMessage(jid, { text });
      await letDeliveryFlush();
    });
  }

  async logout(userId: string): Promise<void> {
    await this.withOpenSocket(userId, ({ socket }) => socket.logout());
  }

  private withOpenSocket(userId: string, run: (opened: OpenedSocket) => Promise<unknown>): Promise<void> {
    return this.lock.run(userId, async () => {
      const opened = await this.open(this.store, userId);
      try {
        if (!opened.registered) throw new WhatsappLoggedOutError();
        await waitForOpen(opened.socket);
        await run(opened);
      } finally {
        await opened.flush().catch((error) => console.error('Failed to flush WhatsApp session:', error));
        await opened.socket.end(undefined);
      }
    });
  }
}
