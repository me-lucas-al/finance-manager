import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectionBadge } from '@/components/shared/ConnectionBadge';
import { WhatsappConnection } from '@/components/whatsapp/WhatsappConnection';
import { getOnboardingState } from '@/app/actions/onboarding';
import { getWhatsappConnection } from '@/app/actions/whatsapp';
import { UnavailableCard } from './UnavailableCard';

async function loadConnections() {
  try {
    const [onboarding, whatsapp] = await Promise.all([getOnboardingState(), getWhatsappConnection()]);
    return { telegramLinked: onboarding.telegramLinked, whatsappConnected: whatsapp.connected };
  } catch (error) {
    console.error('Failed to load the connections:', error);
    return null;
  }
}

export async function ConnectionsCard() {
  const connections = await loadConnections();
  if (!connections) return <UnavailableCard title="Conexões" />;

  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Conexões</CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Canais onde você registra lançamentos e recebe avisos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-200">WhatsApp</p>
          <WhatsappConnection initiallyConnected={connections.whatsappConnected} />
        </div>
        <div className="space-y-2 border-t border-zinc-800 pt-4">
          <p className="text-sm font-medium text-zinc-200">Telegram</p>
          <div className="flex items-center justify-between gap-3">
            <ConnectionBadge connected={connections.telegramLinked} />
            <Link href="/settings" className="text-xs text-blue-400 hover:text-blue-300">
              Gerenciar
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
