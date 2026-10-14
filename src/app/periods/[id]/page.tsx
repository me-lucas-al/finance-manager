import { notFound } from 'next/navigation';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import { periodHistoryService } from '@/composition/period-history';
import { formatPeriodRange } from '@/modules/periods/domain/services/period-date';
import { BackToPeriodsLink } from '@/components/periods/BackToPeriodsLink';
import { PeriodStatusBadge } from '@/components/periods/PeriodStatusBadge';
import { PeriodTotalsGrid } from '@/components/periods/PeriodTotalsGrid';
import { PeriodSnapshotCard } from '@/components/periods/PeriodSnapshotCard';
import { PeriodEntriesList } from '@/components/periods/PeriodEntriesList';

export default async function PeriodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  const detail = await periodHistoryService.findDetail(userId, id);
  if (!detail) notFound();

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-background min-h-screen">
      <BackToPeriodsLink />
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {formatPeriodRange(detail.startDate, detail.endDate)}
        </h2>
        <PeriodStatusBadge closed={detail.closed} />
      </div>
      <PeriodTotalsGrid totals={detail.totals} />
      {detail.snapshot && <PeriodSnapshotCard snapshot={detail.snapshot} />}
      <PeriodEntriesList entries={detail.entries} />
    </div>
  );
}
