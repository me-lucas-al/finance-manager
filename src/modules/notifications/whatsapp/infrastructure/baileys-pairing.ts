import { DisconnectReason } from '@whiskeysockets/baileys';
import { AsyncQueue } from '@/shared/infrastructure/async-queue';
import type { KeyedMutex } from '@/shared/infrastructure/keyed-mutex';
import type { WhatsappAuthStore } from '../domain/whatsapp-auth-store';
import type { PairingEvent, WhatsappPairing } from '../domain/whatsapp-pairing';
import { closeStatusCode, ownJidOf, type ConnectionUpdate } from './baileys-connection';
import { openSocket, type OpenedSocket, type SocketOpener } from './baileys-socket';
import { sessionLock } from './session-lock';

const MAX_RESTARTS = 3;

const failure = (error: unknown): PairingEvent => ({
  type: 'failed',
  reason: error instanceof Error ? error.message : 'Falha ao conectar',
});

function finish(events: AsyncQueue<PairingEvent>, event: PairingEvent): void {
  events.push(event);
  events.close();
}

export class BaileysPairing implements WhatsappPairing {
  constructor(
    private readonly store: WhatsappAuthStore,
    private readonly open: SocketOpener = openSocket,
    private readonly lock: KeyedMutex = sessionLock,
  ) {}

  async *pair(userId: string, signal: AbortSignal): AsyncIterable<PairingEvent> {
    const release = await this.lock.acquire(userId);
    const events = new AsyncQueue<PairingEvent>();
    const opened: OpenedSocket[] = [];
    let closed = false;
    let restarts = 0;

    const handle = (connection: OpenedSocket, update: ConnectionUpdate) => {
      if (update.qr) events.push({ type: 'qr', qr: update.qr });
      if (update.connection === 'open') return void confirm(connection);
      if (update.connection !== 'close') return;
      const restartable = closeStatusCode(update) === DisconnectReason.restartRequired && restarts < MAX_RESTARTS;
      if (!restartable) return finish(events, failure(new Error('Conexão encerrada pelo WhatsApp.')));
      restarts++;
      void connection.flush().then(attach).catch((error) => finish(events, failure(error)));
    };

    const confirm = async (connection: OpenedSocket) => {
      try {
        await connection.flush();
        const jid = ownJidOf(connection.socket);
        finish(events, jid ? { type: 'connected', jid } : failure(new Error('Número do WhatsApp não identificado.')));
      } catch (error) {
        finish(events, failure(error));
      }
    };

    const attach = async (): Promise<void> => {
      const connection = await this.open(this.store, userId);
      if (closed) return void (await connection.socket.end(undefined));
      opened.push(connection);
      connection.socket.ev.on('connection.update', (update) => handle(connection, update));
    };

    const stop = () => events.close();
    signal.addEventListener('abort', stop);
    try {
      await attach();
      yield* events;
    } finally {
      closed = true;
      signal.removeEventListener('abort', stop);
      await Promise.all(opened.map((connection) => this.shutdown(connection)));
      release();
    }
  }

  private async shutdown(connection: OpenedSocket): Promise<void> {
    await connection.flush().catch((error) => console.error('Failed to flush WhatsApp session:', error));
    await connection.socket.end(undefined);
  }
}
