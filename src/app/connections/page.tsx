import { OpenFinanceConnect } from './OpenFinanceConnect';
import { ConnectionsView } from '@/components/connections/ConnectionsView';

export default async function ConnectionsPage() {
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
        <ConnectionsView />
      </div>
    </div>
  );
}
