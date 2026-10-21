import { GetWhatsappStatusUseCase } from '@/modules/notifications/whatsapp/application/get-whatsapp-status';
import { LinkWhatsappUseCase } from '@/modules/notifications/whatsapp/application/link-whatsapp';
import { SendWhatsappMessageUseCase } from '@/modules/notifications/whatsapp/application/send-whatsapp-message';
import { UnlinkWhatsappUseCase } from '@/modules/notifications/whatsapp/application/unlink-whatsapp';
import { BaileysPairing } from '@/modules/notifications/whatsapp/infrastructure/baileys-pairing';
import { BaileysSender } from '@/modules/notifications/whatsapp/infrastructure/baileys-sender';
import { SupabaseWhatsappAuthStore } from '@/modules/notifications/whatsapp/infrastructure/supabase-whatsapp-auth-store';
import { SupabaseWhatsappLinkRepository } from '@/modules/notifications/whatsapp/infrastructure/supabase-whatsapp-link-repository';

const whatsappLinkRepository = new SupabaseWhatsappLinkRepository();
const whatsappAuthStore = new SupabaseWhatsappAuthStore();
const whatsappSender = new BaileysSender(whatsappAuthStore);

export const whatsappMessenger = new SendWhatsappMessageUseCase(whatsappLinkRepository, whatsappSender, whatsappAuthStore);
export const linkWhatsapp = new LinkWhatsappUseCase(new BaileysPairing(whatsappAuthStore), whatsappLinkRepository);
export const unlinkWhatsapp = new UnlinkWhatsappUseCase(whatsappLinkRepository, whatsappSender, whatsappAuthStore);
export const getWhatsappStatus = new GetWhatsappStatusUseCase(whatsappLinkRepository);
