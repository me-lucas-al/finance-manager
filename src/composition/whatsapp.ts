import { GetWhatsappStatusUseCase } from '@/modules/notifications/whatsapp/application/get-whatsapp-status';
import { LinkWhatsappUseCase } from '@/modules/notifications/whatsapp/application/link-whatsapp';
import { SendWhatsappMessageUseCase } from '@/modules/notifications/whatsapp/application/send-whatsapp-message';
import { UnlinkWhatsappUseCase } from '@/modules/notifications/whatsapp/application/unlink-whatsapp';
import { BaileysPairing } from '@/modules/notifications/whatsapp/infrastructure/baileys-pairing';
import { BaileysSender } from '@/modules/notifications/whatsapp/infrastructure/baileys-sender';
import { EncryptedWhatsappAuthStore } from '@/modules/notifications/whatsapp/infrastructure/encrypted-whatsapp-auth-store';
import { AesGcmSessionCipher } from '@/modules/notifications/whatsapp/infrastructure/session-cipher';
import { SupabaseWhatsappAuthStore } from '@/modules/notifications/whatsapp/infrastructure/supabase-whatsapp-auth-store';
import { SupabaseWhatsappLinkRepository } from '@/modules/notifications/whatsapp/infrastructure/supabase-whatsapp-link-repository';

const whatsappLinkRepository = new SupabaseWhatsappLinkRepository();
const whatsappAuthStore = new EncryptedWhatsappAuthStore(new SupabaseWhatsappAuthStore(), new AesGcmSessionCipher());
const whatsappSender = new BaileysSender(whatsappAuthStore);

export const whatsappMessenger = new SendWhatsappMessageUseCase(whatsappLinkRepository, whatsappSender, whatsappAuthStore);
export const linkWhatsapp = new LinkWhatsappUseCase(new BaileysPairing(whatsappAuthStore), whatsappLinkRepository, whatsappAuthStore);
export const unlinkWhatsapp = new UnlinkWhatsappUseCase(whatsappLinkRepository, whatsappSender, whatsappAuthStore);
export const getWhatsappStatus = new GetWhatsappStatusUseCase(whatsappLinkRepository);
