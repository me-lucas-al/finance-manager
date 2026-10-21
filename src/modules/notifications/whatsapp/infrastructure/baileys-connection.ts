import { DisconnectReason, jidNormalizedUser, type WASocket } from '@whiskeysockets/baileys';
import { WhatsappLoggedOutError } from '../domain/whatsapp-sender';

const OPEN_TIMEOUT_MS = 20_000;
const FLUSH_MS = 2_000;

export type ConnectionUpdate = { connection?: string; qr?: string } & CloseInfo;

type CloseInfo = { lastDisconnect?: { error?: Error & { output?: { statusCode?: number } } } };

export const closeStatusCode = (update: CloseInfo): number | undefined =>
  update.lastDisconnect?.error?.output?.statusCode;

export const ownJidOf = (socket: WASocket): string | null => {
  const id = socket.user?.id;
  return id ? jidNormalizedUser(id) : null;
};

export function waitForOpen(socket: WASocket): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => finish(new Error('WhatsApp connection timed out')), OPEN_TIMEOUT_MS);
    const listener = (update: ConnectionUpdate) => {
      if (update.connection === 'open') return finish();
      if (update.connection !== 'close') return;
      const loggedOut = closeStatusCode(update) === DisconnectReason.loggedOut;
      finish(loggedOut ? new WhatsappLoggedOutError() : new Error('WhatsApp connection closed'));
    };
    function finish(error?: Error) {
      clearTimeout(timer);
      socket.ev.off('connection.update', listener);
      if (error) reject(error);
      else resolve();
    }
    socket.ev.on('connection.update', listener);
  });
}

export const letDeliveryFlush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, FLUSH_MS));
