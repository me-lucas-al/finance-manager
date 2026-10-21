import { describe, it, expect } from 'vitest';
import { KeyedMutex } from '@/shared/infrastructure/keyed-mutex';
import { BaileysPairing } from '@/modules/notifications/whatsapp/infrastructure/baileys-pairing';
import { FakeWhatsappAuthStore } from '@/tests/fakes/fake-whatsapp';
import { closeWith, fakeOpened, runPairing, sequenceOpener, tick, waitFor } from '@/tests/fakes/fake-baileys-socket';

const RESTART_REQUIRED = 515;

describe('BaileysPairing lifecycle', () => {
  it('closes a socket that finishes opening after the pairing was aborted', async () => {
    const first = fakeOpened();
    const late = fakeOpened();
    const controller = new AbortController();
    let releaseLate = () => {};
    const open = sequenceOpener(first);
    const opener = (async (...args: Parameters<typeof open>) => {
      if (open.mock.calls.length === 0) return open(...args);
      await new Promise<void>((resolve) => (releaseLate = resolve));
      return late;
    }) as typeof open;
    const pairing = new BaileysPairing(new FakeWhatsappAuthStore(), opener, new KeyedMutex());
    const { done } = runPairing(pairing, controller.signal);

    await waitFor(() => first.fake.ev.listenerCount('connection.update') > 0);
    first.fake.update(closeWith(RESTART_REQUIRED));
    await tick();
    controller.abort();
    await done;
    releaseLate();
    await tick();
    await tick();

    expect(late.fake.end).toHaveBeenCalled();
  });

  it('lets only one pairing at a time hold the session', async () => {
    const mutex = new KeyedMutex();
    const first = fakeOpened();
    const second = fakeOpened();
    const open = sequenceOpener(first, second);
    const one = runPairing(new BaileysPairing(new FakeWhatsappAuthStore(), open, mutex));
    const two = runPairing(new BaileysPairing(new FakeWhatsappAuthStore(), open, mutex));

    await waitFor(() => first.fake.ev.listenerCount('connection.update') > 0);
    await tick();
    expect(open).toHaveBeenCalledTimes(1);

    first.fake.update({ connection: 'open' });
    await one.done;
    await waitFor(() => second.fake.ev.listenerCount('connection.update') > 0);
    second.fake.update({ connection: 'open' });
    await two.done;
    expect(open).toHaveBeenCalledTimes(2);
  });
});
