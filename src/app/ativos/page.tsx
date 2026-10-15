import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import { getLiveInvestmentsData } from '@/composition/finance-views';
import { AtivosList } from '@/components/ativos/AtivosList';
import { NewEntryButton } from '@/components/entries/NewEntryButton';
import { Suspense } from 'react';

export default async function AtivosPage() {
  const data = await getLiveInvestmentsData(await requireUserId());

  return (
    <div className="flex-1 min-h-screen bg-[#09090b] text-[#fafafa]">
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">Ativos</h1>
            <p className="text-sm text-zinc-400">
              Seus investimentos e movimentações.
            </p>
          </div>
          <NewEntryButton type="investment" label="Novo investimento" />
        </div>

        <Suspense fallback={<div className="text-zinc-400">Carregando ativos...</div>}>
          <AtivosList initialTotal={data.total} initialAssets={data.assets} />
        </Suspense>
      </div>
    </div>
  );
}
