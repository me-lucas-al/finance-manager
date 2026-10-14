import { getOnboardingState } from '@/app/actions/onboarding';
import { DataSourceCard } from './DataSourceCard';
import { TelegramCard } from './TelegramCard';

export async function IntegrationsSection() {
  const onboarding = await getOnboardingState();

  return (
    <>
      <TelegramCard initiallyLinked={onboarding.telegramLinked} />
      {onboarding.dataMode && <DataSourceCard currentMode={onboarding.dataMode} />}
    </>
  );
}
