import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import { periodHistoryService } from '@/composition/period-history';
import { BackToPeriodsLink } from '@/components/periods/BackToPeriodsLink';
import { PeriodHistoryList } from '@/components/periods/PeriodHistoryList';

export default async function PeriodHistoryPage() {
  const userId = await requireUserId();
  const periods = await periodHistoryService.listHistory(userId);

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-background min-h-screen">
      <BackToPeriodsLink />
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Histórico de Períodos</h2>
        <p className="text-sm text-muted-foreground">Todos os seus períodos, abertos e fechados.</p>
      </div>
      <PeriodHistoryList periods={periods} />
    </div>
  );
}
