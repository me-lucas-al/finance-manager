import type { TelegramLinkRepository } from '../domain/telegram-link-repository';
import type { TelegramMessenger } from '../domain/telegram-messenger';

const START_PATTERN = /^\/start(?:@\w+)?(?:\s+(\S+))?$/i;

const LINK_INSTRUCTIONS =
  'Para vincular sua conta, gere um código no app (Configurações → Telegram) e envie: /start SEU_CODIGO';

export function parseStartCommand(text: string): { code: string | undefined } | null {
  const match = text.trim().match(START_PATTERN);
  return match ? { code: match[1] } : null;
}

export async function handleStartCommand(
  links: Pick<TelegramLinkRepository, 'consumeLinkCode' | 'findUserIdByChatId'>,
  messenger: Pick<TelegramMessenger, 'sendToChat'>,
  chatId: number,
  code: string | undefined,
): Promise<void> {
  if (code) {
    const linkedUserId = await links.consumeLinkCode(code, chatId);
    const reply = linkedUserId
      ? '✅ Telegram vinculado! Agora você pode registrar gastos e conversar com o assistente por aqui.'
      : '❌ Código inválido ou expirado. Gere um novo código no app (Configurações → Telegram).';
    await messenger.sendToChat(chatId, reply);
    return;
  }

  const alreadyLinked = await links.findUserIdByChatId(chatId);
  const reply = alreadyLinked ? 'Você já está vinculado. É só me mandar seus gastos!' : `Olá! ${LINK_INSTRUCTIONS}`;
  await messenger.sendToChat(chatId, reply);
}
