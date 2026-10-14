import { TelegramService } from '@/modules/notifications/telegram/telegram-service';
import { SupabaseTelegramLinkRepository } from '@/modules/notifications/telegram/infrastructure/supabase-telegram-link-repository';
import { SupabaseTelegramUpdateRepository } from '@/modules/notifications/telegram/infrastructure/supabase-telegram-update-repository';

export const telegramLinkRepository = new SupabaseTelegramLinkRepository();
export const telegramUpdateRepository = new SupabaseTelegramUpdateRepository();
export const telegramMessenger = new TelegramService(telegramLinkRepository);
