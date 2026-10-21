import { describe, it, expect, beforeEach } from 'vitest';
import { LinkWhatsappUseCase } from '@/modules/notifications/whatsapp/application/link-whatsapp';
import type { PairingEvent } from '@/modules/notifications/whatsapp/domain/whatsapp-pairing';
import { FakeWhatsappAuthStore, FakeWhatsappLinkRepository, FakeWhatsappPairing } from '@/tests/fakes/fake-whatsapp';

const JID = '5511999999999@s.whatsapp.net';

describe('LinkWhatsappUseCase guards', () => {
  let links: FakeWhatsappLinkRepository;
  let store: FakeWhatsappAuthStore;

  beforeEach(() => {
    links = new FakeWhatsappLinkRepository();
    store = new FakeWhatsappAuthStore();
  });

  const collect = async (events: PairingEvent[]) => {
    const useCase = new LinkWhatsappUseCase(new FakeWhatsappPairing(events), links, store);
    for await (const event of useCase.execute('u1', new AbortController().signal)) void event;
  };


  it('refuses a second pairing while one is running for the same user', async () => {
    let release = () => {};
    const slow = {
      async *pair() {
        await new Promise<void>((resolve) => (release = resolve));
        yield { type: 'qr', qr: 'x' } as PairingEvent;
      },
    };
    const useCase = new LinkWhatsappUseCase(slow, links, store);
    const first = useCase.execute('u1', new AbortController().signal)[Symbol.asyncIterator]();
    const pending = first.next();

    const second: PairingEvent[] = [];
    for await (const event of useCase.execute('u1', new AbortController().signal)) second.push(event);
    release();
    await pending;

    expect(second).toEqual([expect.objectContaining({ type: 'failed' })]);
  });

  it('discards the saved session when pairing ends without a link', async () => {
    await store.write('u1', { creds: '{}' });

    await collect([{ type: 'failed', reason: 'x' }]);

    expect(await store.readMany('u1', ['creds'])).toEqual({});
  });

  it('keeps the saved session of a user that is already linked', async () => {
    await links.save('u1', JID);
    await store.write('u1', { creds: '{}' });

    await collect([{ type: 'failed', reason: 'x' }]);

    expect(await store.readMany('u1', ['creds'])).toEqual({ creds: '{}' });
  });
});
