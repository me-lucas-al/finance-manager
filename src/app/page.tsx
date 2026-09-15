import { auth } from '@/auth';
import { OverviewCards } from '@/components/overview/OverviewCards';
import { BalanceEvolutionCard } from '@/components/overview/BalanceEvolutionCard';
import { SupabaseAccountRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import { groupAccountsByItem } from '@/components/connections/group-accounts';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let connectedAccounts: any[] = [];
  if (userId) {
    try {
      connectedAccounts = await new SupabaseAccountRepository().findAllByUserId(userId);
    } catch {
      connectedAccounts = [];
    }
  }

  const bankConnections = groupAccountsByItem(connectedAccounts);

  return (
    <div className="flex-1 min-h-screen bg-[#09090b] text-[#fafafa]">
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Page Heading */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Overview</h1>
          <p className="text-sm text-zinc-400">
            Visão geral dos seus dados financeiros.
          </p>
        </div>

        {/* Top 3 Cards Row */}
        <OverviewCards />

        {/* Bottom Wide Card: Evolução do Saldo */}
        <BalanceEvolutionCard balance={2229.81} />
      </div>
    </div>
  );
}
