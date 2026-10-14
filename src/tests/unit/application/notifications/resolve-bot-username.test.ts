import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearBotUsernameCache, resolveBotUsername } from '@/modules/notifications/telegram/resolve-bot-username';

describe('resolveBotUsername', () => {
  beforeEach(() => clearBotUsernameCache());

  it('prefers the configured username and strips the @', async () => {
    const fetchBotUsername = vi.fn();

    const username = await resolveBotUsername({ NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: '@my_bot' }, fetchBotUsername);

    expect(username).toBe('my_bot');
    expect(fetchBotUsername).not.toHaveBeenCalled();
  });

  it('asks Telegram when nothing is configured', async () => {
    const fetchBotUsername = vi.fn().mockResolvedValue('finance_bot');

    const username = await resolveBotUsername({ TELEGRAM_BOT_TOKEN: 'token' }, fetchBotUsername);

    expect(username).toBe('finance_bot');
    expect(fetchBotUsername).toHaveBeenCalledWith('token');
  });

  it('caches the answer from Telegram', async () => {
    const fetchBotUsername = vi.fn().mockResolvedValue('finance_bot');

    await resolveBotUsername({ TELEGRAM_BOT_TOKEN: 'token' }, fetchBotUsername);
    await resolveBotUsername({ TELEGRAM_BOT_TOKEN: 'token' }, fetchBotUsername);

    expect(fetchBotUsername).toHaveBeenCalledTimes(1);
  });

  it('returns null without a token', async () => {
    const fetchBotUsername = vi.fn();

    expect(await resolveBotUsername({}, fetchBotUsername)).toBeNull();
    expect(fetchBotUsername).not.toHaveBeenCalled();
  });

  it('returns null and does not cache when Telegram fails', async () => {
    const fetchBotUsername = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce('finance_bot');

    expect(await resolveBotUsername({ TELEGRAM_BOT_TOKEN: 'token' }, fetchBotUsername)).toBeNull();
    expect(await resolveBotUsername({ TELEGRAM_BOT_TOKEN: 'token' }, fetchBotUsername)).toBe('finance_bot');
  });
});
