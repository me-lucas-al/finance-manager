import { describe, it, expect, beforeEach, vi } from 'vitest';

const after = vi.fn();
vi.mock('next/server', () => ({ after }));

const entries = [{ kind: 'expense' as const, description: 'Pix', amount: 10, bank: 'Itaú' }];

describe('DeferredImportAnnouncer', () => {
  const sendMessage = vi.fn();

  beforeEach(() => {
    sendMessage.mockReset().mockResolvedValue(true);
    after.mockReset().mockImplementation((work: () => unknown) => void work());
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  const announcer = async () => {
    const { DeferredImportAnnouncer } = await import('@/modules/pluggy-sync/infrastructure/deferred-import-announcer');
    return new DeferredImportAnnouncer({ sendMessage });
  };

  it('sends nothing when there are no new entries', async () => {
    await (await announcer()).announce('u1', []);

    expect(after).not.toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('sends the summary after the response', async () => {
    await (await announcer()).announce('u1', entries);

    expect(after).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith('u1', expect.stringContaining('1 novo lançamento importado'));
  });

  it('sends right away when it runs outside a request', async () => {
    after.mockImplementation(() => {
      throw new Error('outside request scope');
    });

    await (await announcer()).announce('u1', entries);

    expect(sendMessage).toHaveBeenCalledTimes(1);
  });

  it('never throws when the message fails', async () => {
    sendMessage.mockRejectedValue(new Error('offline'));

    await expect((await announcer()).announce('u1', entries)).resolves.toBeUndefined();
  });
});
