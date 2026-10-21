import { EventEmitter } from 'node:events';
import { vi, type Mock } from 'vitest';
import type { OpenedSocket, SocketOpener } from '@/modules/notifications/whatsapp/infrastructure/baileys-socket';
import type { PairingEvent, WhatsappPairing } from '@/modules/notifications/whatsapp/domain/whatsapp-pairing';

export class FakeSocket {
  public ev = new EventEmitter();
  public user: { id: string } | undefined = { id: '5511999999999:7@s.whatsapp.net' };
  public end = vi.fn(async () => undefined);
  public logout = vi.fn(async () => undefined);
  public sendMessage = vi.fn(async () => undefined);

  update(payload: object) {
    this.ev.emit('connection.update', payload);
  }
}

export type FakeOpened = Omit<OpenedSocket, 'flush'> & { fake: FakeSocket; flush: Mock<() => Promise<void>> };

export function fakeOpened(overrides: { registered?: boolean } = {}): FakeOpened {
  const fake = new FakeSocket();
  return { socket: fake as never, registered: true, flush: vi.fn(async () => undefined), fake, ...overrides };
}

export function sequenceOpener(...sockets: FakeOpened[]): SocketOpener & ReturnType<typeof vi.fn> {
  const queue = [...sockets];
  return vi.fn(async () => {
    const next = queue.shift();
    if (!next) throw new Error('no more fake sockets');
    return next;
  }) as never;
}

export const tick = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

export async function waitFor(condition: () => boolean, attempts = 50): Promise<void> {
  for (let index = 0; index < attempts && !condition(); index++) await tick();
  if (!condition()) throw new Error('condition not met');
}

export const closeWith = (statusCode: number) => ({
  connection: 'close',
  lastDisconnect: { error: Object.assign(new Error('closed'), { output: { statusCode } }) },
});

export function runPairing(pairing: WhatsappPairing, signal: AbortSignal = new AbortController().signal) {
  const seen: PairingEvent[] = [];
  const done = (async () => {
    for await (const event of pairing.pair('u1', signal)) seen.push(event);
  })();
  return { seen, done };
}
