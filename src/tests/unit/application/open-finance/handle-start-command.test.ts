import { describe, expect, it, vi } from 'vitest';
import { handleStartCommand, parseStartCommand } from '@/modules/notifications/telegram/application/handle-start-command';

function buildLinks(overrides: Partial<Record<'consumeLinkCode' | 'findUserIdByChatId', unknown>> = {}) {
  return {
    consumeLinkCode: vi.fn().mockResolvedValue(null),
    findUserIdByChatId: vi.fn().mockResolvedValue(null),
    ...overrides,
  } as Parameters<typeof handleStartCommand>[0];
}

describe('handleStartCommand', () => {
  it('parses the optional link code from /start', () => {
    expect(parseStartCommand('/start ABC123')).toEqual({ code: 'ABC123' });
    expect(parseStartCommand('/start')).toEqual({ code: undefined });
    expect(parseStartCommand('hello')).toBeNull();
  });

  it('confirms the link when the code is valid', async () => {
    const messenger = { sendToChat: vi.fn() };

    await handleStartCommand(buildLinks({ consumeLinkCode: vi.fn().mockResolvedValue('user-1') }), messenger, 10, 'CODE');

    expect(messenger.sendToChat).toHaveBeenCalledWith(10, expect.stringContaining('vinculado'));
  });

  it('rejects an invalid code', async () => {
    const messenger = { sendToChat: vi.fn() };

    await handleStartCommand(buildLinks(), messenger, 10, 'BAD');

    expect(messenger.sendToChat).toHaveBeenCalledWith(10, expect.stringContaining('inválido'));
  });

  it('tells already linked users they can send entries', async () => {
    const messenger = { sendToChat: vi.fn() };

    await handleStartCommand(buildLinks({ findUserIdByChatId: vi.fn().mockResolvedValue('user-1') }), messenger, 10, undefined);

    expect(messenger.sendToChat).toHaveBeenCalledWith(10, expect.stringContaining('já está vinculado'));
  });
});
