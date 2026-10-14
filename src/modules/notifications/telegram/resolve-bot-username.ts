type FetchBotInfo = (token: string) => Promise<string | null>;
type BotEnv = Record<string, string | undefined>;

let cachedUsername: string | null = null;

async function fetchUsernameFromTelegram(token: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const body = (await response.json()) as { ok?: boolean; result?: { username?: string } };
    return body.ok ? (body.result?.username ?? null) : null;
  } catch {
    return null;
  }
}

export async function resolveBotUsername(
  env: BotEnv = process.env,
  fetchBotUsername: FetchBotInfo = fetchUsernameFromTelegram,
): Promise<string | null> {
  const configured = env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, '').trim();
  if (configured) return configured;
  if (cachedUsername) return cachedUsername;

  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;

  cachedUsername = await fetchBotUsername(token);
  return cachedUsername;
}

export function clearBotUsernameCache(): void {
  cachedUsername = null;
}
