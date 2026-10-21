import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetWhatsappStatusUseCase } from '@/modules/notifications/whatsapp/application/get-whatsapp-status';
import { LinkWhatsappUseCase } from '@/modules/notifications/whatsapp/application/link-whatsapp';
import { SendWhatsappMessageUseCase } from '@/modules/notifications/whatsapp/application/send-whatsapp-message';
import { UnlinkWhatsappUseCase } from '@/modules/notifications/whatsapp/application/unlink-whatsapp';
import { WhatsappLoggedOutError } from '@/modules/notifications/whatsapp/domain/whatsapp-sender';
import type { PairingEvent } from '@/modules/notifications/whatsapp/domain/whatsapp-pairing';
import {
  FakeWhatsappAuthStore,
  FakeWhatsappLinkRepository,
  FakeWhatsappPairing,
  FakeWhatsappSender,
} from '@/tests/fakes/fake-whatsapp';

const JID = '5511999999999@s.whatsapp.net';

describe('WhatsApp use cases', () => {
  let links: FakeWhatsappLinkRepository;
  let store: FakeWhatsappAuthStore;
  let sender: FakeWhatsappSender;

  beforeEach(() => {
    links = new FakeWhatsappLinkRepository();
    store = new FakeWhatsappAuthStore();
    sender = new FakeWhatsappSender();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  const collect = async (events: PairingEvent[]) => {
    const useCase = new LinkWhatsappUseCase(new FakeWhatsappPairing(events), links);
    const seen: PairingEvent[] = [];
    for await (const event of useCase.execute('u1', new AbortController().signal)) seen.push(event);
    return seen;
  };

  it('forwards the QR codes and stores the link once connected', async () => {
    const seen = await collect([{ type: 'qr', qr: 'abc' }, { type: 'connected', jid: JID }]);

    expect(seen.map((event) => event.type)).toEqual(['qr', 'connected']);
    expect(await links.findByUserId('u1')).toMatchObject({ jid: JID });
  });

  it('does not store a link when pairing fails', async () => {
    await collect([{ type: 'failed', reason: 'x' }]);

    expect(await links.findByUserId('u1')).toBeNull();
  });

  it('reports the connection status from the stored link', async () => {
    const status = new GetWhatsappStatusUseCase(links);

    expect(await status.execute('u1')).toEqual({ connected: false });
    await links.save('u1', JID);
    expect(await status.execute('u1')).toEqual({ connected: true });
  });

  it('sends the text to the linked number', async () => {
    await links.save('u1', JID);

    const sent = await new SendWhatsappMessageUseCase(links, sender, store).sendMessage('u1', 'oi');

    expect(sent).toBe(true);
    expect(sender.sent).toEqual([{ userId: 'u1', jid: JID, text: 'oi' }]);
  });

  it('does nothing for a user without a link', async () => {
    const sent = await new SendWhatsappMessageUseCase(links, sender, store).sendMessage('u1', 'oi');

    expect(sent).toBe(false);
    expect(sender.sent).toEqual([]);
  });

  it('keeps the link when a send fails for a transient reason', async () => {
    await links.save('u1', JID);
    sender.failWith = new Error('timeout');

    const sent = await new SendWhatsappMessageUseCase(links, sender, store).sendMessage('u1', 'oi');

    expect(sent).toBe(false);
    expect(await links.findByUserId('u1')).not.toBeNull();
  });

  it('forgets the session when WhatsApp says it was logged out', async () => {
    await links.save('u1', JID);
    await store.write('u1', { creds: '{}' });
    sender.failWith = new WhatsappLoggedOutError();

    await new SendWhatsappMessageUseCase(links, sender, store).sendMessage('u1', 'oi');

    expect(await links.findByUserId('u1')).toBeNull();
    expect(await store.readMany('u1', ['creds'])).toEqual({});
  });

  it('logs out, clears the session and removes the link on unlink', async () => {
    await links.save('u1', JID);
    await store.write('u1', { creds: '{}' });

    await new UnlinkWhatsappUseCase(links, sender, store).execute('u1');

    expect(sender.loggedOut).toEqual(['u1']);
    expect(await links.findByUserId('u1')).toBeNull();
    expect(await store.readMany('u1', ['creds'])).toEqual({});
  });
});
