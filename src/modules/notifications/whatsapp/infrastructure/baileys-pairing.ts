import { DisconnectReason, type WASocket } from '@whiskeysockets/baileys';
import { AsyncQueue } from '@/shared/infrastructure/async-queue';
import type { WhatsappAuthStore } from '../domain/whatsapp-auth-store';
import type { PairingEvent, WhatsappPairing } from '../domain/whatsapp-pairing';
import { closeStatusCode, ownJidOf } from './baileys-connection';
import { openSocket } from './baileys-socket';

function finish(events: AsyncQueue<PairingEvent>, event: PairingEvent): void {
  events.push(event);
  events.close();
}

function fail(events: AsyncQueue<PairingEvent>, error: unknown): void {
  finish(events, { type: 'failed', reason: error instanceof Error ? error.message : 'Falha ao conectar' });
}

export class BaileysPairing implements WhatsappPairing {
  constructor(private readonly store: WhatsappAuthStore) {}

  async *pair(userId: string, signal: AbortSignal): AsyncIterable<PairingEvent> {
    const events = new AsyncQueue<PairingEvent>();
    const sockets: WASocket[] = [];

    const attach = async (): Promise<void> => {
      const socket = await openSocket(this.store, userId);
      sockets.push(socket);
      socket.ev.on('connection.update', (update) => {
        if (update.qr) events.push({ type: 'qr', qr: update.qr });
        if (update.connection === 'open') return finish(events, { type: 'connected', jid: ownJidOf(socket) ?? '' });
        if (update.connection !== 'close') return;
        const code = closeStatusCode(update);
        if (code === DisconnectReason.restartRequired) return void attach().catch((error) => fail(events, error));
        finish(events, { type: 'failed', reason: `Conexão encerrada (${code ?? 'desconhecido'})` });
      });
    };

    const stop = () => events.close();
    signal.addEventListener('abort', stop);
    try {
      await attach();
      yield* events;
    } finally {
      signal.removeEventListener('abort', stop);
      await Promise.all(sockets.map((socket) => socket.end(undefined)));
    }
  }
}
