import { describe, it, expect, vi } from 'vitest';
import { KeyedMutex } from '@/shared/infrastructure/keyed-mutex';
import { BaileysSender } from '@/modules/notifications/whatsapp/infrastructure/baileys-sender';
import { WhatsappLoggedOutError } from '@/modules/notifications/whatsapp/domain/whatsapp-sender';
import { FakeWhatsappAuthStore } from '@/tests/fakes/fake-whatsapp';
import { closeWith, fakeOpened, sequenceOpener, tick, waitFor } from '@/tests/fakes/fake-baileys-socket';

const LOGGED_OUT = 401;
const JID = '5511999999999@s.whatsapp.net';

vi.mock('@/modules/notifications/whatsapp/infrastructure/baileys-connection', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/notifications/whatsapp/infrastructure/baileys-connection')>()),
  letDeliveryFlush: async () => undefined,
}));

describe('BaileysSender', () => {
  const sender = (open: ReturnType<typeof sequenceOpener>, lock = new KeyedMutex()) =>
    new BaileysSender(new FakeWhatsappAuthStore(), open, lock);

  it('sends the text, saves the session and then closes the socket', async () => {
    const opened = fakeOpened();
    const order: string[] = [];
    opened.flush.mockImplementation(async () => void order.push('flush'));
    opened.fake.end.mockImplementation(async () => void order.push('end'));
    const sending = sender(sequenceOpener(opened)).sendText('u1', JID, 'oi');

    await waitFor(() => opened.fake.ev.listenerCount('connection.update') > 0);
    opened.fake.update({ connection: 'open' });
    await sending;

    expect(opened.fake.sendMessage).toHaveBeenCalledWith(JID, { text: 'oi' });
    expect(order).toEqual(['flush', 'end']);
  });

  it('fails at once when the saved session is not registered', async () => {
    const opened = fakeOpened({ registered: false });

    await expect(sender(sequenceOpener(opened)).sendText('u1', JID, 'oi')).rejects.toBeInstanceOf(
      WhatsappLoggedOutError,
    );
    expect(opened.fake.end).toHaveBeenCalled();
  });

  it('reports a logout from WhatsApp as a logged out error', async () => {
    const opened = fakeOpened();
    const sending = sender(sequenceOpener(opened)).sendText('u1', JID, 'oi');

    await waitFor(() => opened.fake.ev.listenerCount('connection.update') > 0);
    opened.fake.update(closeWith(LOGGED_OUT));

    await expect(sending).rejects.toBeInstanceOf(WhatsappLoggedOutError);
    expect(opened.fake.end).toHaveBeenCalled();
  });

  it('sends two messages for the same user one after the other', async () => {
    const first = fakeOpened();
    const second = fakeOpened();
    const open = sequenceOpener(first, second);
    const client = sender(open);
    const one = client.sendText('u1', JID, 'um');
    const two = client.sendText('u1', JID, 'dois');

    await waitFor(() => first.fake.ev.listenerCount('connection.update') > 0);
    await tick();
    expect(open).toHaveBeenCalledTimes(1);

    first.fake.update({ connection: 'open' });
    await one;
    await waitFor(() => second.fake.ev.listenerCount('connection.update') > 0);
    second.fake.update({ connection: 'open' });
    await two;

    expect(first.fake.end).toHaveBeenCalled();
    expect(second.fake.sendMessage).toHaveBeenCalledWith(JID, { text: 'dois' });
  });

  it('logs out through the open socket', async () => {
    const opened = fakeOpened();
    const logout = sender(sequenceOpener(opened)).logout('u1');

    await waitFor(() => opened.fake.ev.listenerCount('connection.update') > 0);
    opened.fake.update({ connection: 'open' });
    await logout;

    expect(opened.fake.logout).toHaveBeenCalled();
  });
});
