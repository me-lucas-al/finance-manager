import { getOnboardingState } from '@/app/actions/onboarding';
import { getWhatsappConnection } from '@/app/actions/whatsapp';
import { DataSourceCard } from './DataSourceCard';
import { TelegramCard } from './TelegramCard';
import { WhatsappCard } from './WhatsappCard';

export async function IntegrationsSection() {
  const [onboarding, whatsapp] = await Promise.all([getOnboardingState(), getWhatsappConnection()]);

  return (
    <>
      <TelegramCard initiallyLinked={onboarding.telegramLinked} />
      <WhatsappCard initiallyConnected={whatsapp.connected} />
      {onboarding.dataMode && <DataSourceCard currentMode={onboarding.dataMode} />}
    </>
  );
}
