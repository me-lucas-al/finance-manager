import { OpenFinanceConnect } from './OpenFinanceConnect';
import { ConnectionsView } from '@/components/connections/ConnectionsView';
import { groupAccountsByItem } from '@/components/connections/group-accounts';
import { getEffectiveUserId } from '@/app/actions/require-session';
import { SupabaseAccountRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';

export default async function ConnectionsPage() {
  const userId = await getEffectiveUserId();
  const accounts = await new SupabaseAccountRepository().findAllByUserId(userId);
  const connections = groupAccountsByItem(accounts);

  return (
    <div className="flex-1 min-h-screen bg-[#09090b] text-[#fafafa]">
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 space-y-8">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Data Passport
            </h1>
            <p className="text-sm text-zinc-400">
              Conecte, visualize e gerencie suas conexões financeiras.
            </p>
          </div>

          <OpenFinanceConnect />
        </div>

        {/* Connections and Partner Apps */}
        <ConnectionsView connections={connections} />
      </div>
    </div>
  );
}
