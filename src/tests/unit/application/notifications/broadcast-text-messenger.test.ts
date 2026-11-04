import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BroadcastTextMessenger } from '@/modules/pluggy-sync/infrastructure/broadcast-text-messenger';

describe('BroadcastTextMessenger', () => {
  const whatsapp = { sendMessage: vi.fn() };
  const telegram = { sendMessage: vi.fn() };

  beforeEach(() => {
    whatsapp.sendMessage.mockReset().mockResolvedValue(true);
    telegram.sendMessage.mockReset().mockResolvedValue(42);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  const messenger = () => new BroadcastTextMessenger([whatsapp, telegram]);

  it('sends the same text to every channel', async () => {
    await messenger().sendMessage('u1', 'oi');

    expect(whatsapp.sendMessage).toHaveBeenCalledWith('u1', 'oi');
    expect(telegram.sendMessage).toHaveBeenCalledWith('u1', 'oi');
  });

  it('still reaches the other channel when one throws', async () => {
    whatsapp.sendMessage.mockRejectedValue(new Error('logged out'));

    await expect(messenger().sendMessage('u1', 'oi')).resolves.toBe(true);
    expect(telegram.sendMessage).toHaveBeenCalledTimes(1);
  });

  it('reports false when no channel delivered', async () => {
    whatsapp.sendMessage.mockResolvedValue(false);
    telegram.sendMessage.mockResolvedValue(null);

    await expect(messenger().sendMessage('u1', 'oi')).resolves.toBe(false);
  });
});
