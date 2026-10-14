import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getOnboardingState } from '@/app/actions/onboarding';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

export const metadata = { title: 'Configuração inicial · Finance Manager' };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const state = await getOnboardingState();
  if (state.completed) redirect('/');

  return <OnboardingFlow initialMode={state.dataMode} telegramLinked={state.telegramLinked} />;
}
