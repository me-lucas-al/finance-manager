import { Card, CardContent } from '@/components/ui/card';
import { FixedEntriesPanel } from '@/components/fixed/FixedEntriesPanel';
import { fixedEntriesData } from '@/composition/fixed-entries-views';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';

export default async function FixedEntriesPage() {
  const userId = await requireUserId();
  await fixedEntriesData.catchUp(userId);
  const views = await fixedEntriesData.list(userId);

  return (
    <div className="flex-1 min-h-screen bg-[#09090b] text-[#fafafa]">
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Lançamentos fixos</h1>
          <p className="text-sm text-zinc-400">
            Despesas e receitas que se repetem todo mês e são lançadas sozinhas no vencimento.
          </p>
        </div>
        <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm">
          <CardContent className="px-6 py-5">
            <FixedEntriesPanel views={views} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
