import { describe, it, expect } from 'vitest';
import { KeyedMutex } from '@/shared/infrastructure/keyed-mutex';
import { BaileysPairing } from '@/modules/notifications/whatsapp/infrastructure/baileys-pairing';
import { FakeWhatsappAuthStore } from '@/tests/fakes/fake-whatsapp';
import { closeWith, fakeOpened, runPairing, sequenceOpener, tick, waitFor } from '@/tests/fakes/fake-baileys-socket';

const RESTART_REQUIRED = 515;


describe('BaileysPairing', () => {
  const build = (...sockets: ReturnType<typeof fakeOpened>[]) => {
    const open = sequenceOpener(...sockets);
    return { open, pairing: new BaileysPairing(new FakeWhatsappAuthStore(), open, new KeyedMutex()) };
  };

  it('shows the QR and reopens the socket when WhatsApp asks for a restart', async () => {
    const first = fakeOpened();
    const second = fakeOpened();
    const { open, pairing } = build(first, second);
    const { seen, done } = runPairing(pairing);

    await waitFor(() => first.fake.ev.listenerCount('connection.update') > 0);
    first.fake.update({ qr: 'qr-1' });
    first.fake.update(closeWith(RESTART_REQUIRED));
    await waitFor(() => second.fake.ev.listenerCount('connection.update') > 0);
    second.fake.update({ connection: 'open' });
    await done;

    expect(open).toHaveBeenCalledTimes(2);
    expect(seen).toEqual([
      { type: 'qr', qr: 'qr-1' },
      { type: 'connected', jid: '5511999999999@s.whatsapp.net' },
    ]);
    expect(first.flush).toHaveBeenCalled();
    expect(first.fake.end).toHaveBeenCalled();
    expect(second.fake.end).toHaveBeenCalled();
  });

  it('waits for the session to be saved before reporting the connection', async () => {
    const socket = fakeOpened();
    let finishSaving = () => {};
    socket.flush.mockImplementationOnce(() => new Promise<void>((resolve) => (finishSaving = resolve)));
    const { pairing } = build(socket);
    const { seen, done } = runPairing(pairing);

    await waitFor(() => socket.fake.ev.listenerCount('connection.update') > 0);
    socket.fake.update({ connection: 'open' });
    await tick();
    expect(seen).toEqual([]);

    finishSaving();
    await done;
    expect(seen).toEqual([{ type: 'connected', jid: '5511999999999@s.whatsapp.net' }]);
  });

  it('gives up after too many restarts', async () => {
    const sockets = Array.from({ length: 4 }, () => fakeOpened());
    const { pairing } = build(...sockets);
    const { seen, done } = runPairing(pairing);

    for (const socket of sockets) {
      await waitFor(() => socket.fake.ev.listenerCount('connection.update') > 0);
      socket.fake.update(closeWith(RESTART_REQUIRED));
      await tick();
    }
    await done;

    expect(seen).toEqual([{ type: 'failed', reason: 'Conexão encerrada pelo WhatsApp.' }]);
  });
});
