import { Suspense } from 'react';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import { SectionSkeleton } from '@/components/shared/SectionSkeleton';
import { CurrentPeriodCard } from './CurrentPeriodCard';
import { PastPeriodsCard } from './PastPeriodsCard';
import { PeriodRulesCard } from './PeriodRulesCard';
import { UpcomingPeriodCard } from './UpcomingPeriodCard';

export default async function PeriodsPage() {
  const userId = await requireUserId();

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Calendário Financeiro</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<SectionSkeleton height="h-56" />}>
          <CurrentPeriodCard userId={userId} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton height="h-56" />}>
          <PeriodRulesCard userId={userId} />
        </Suspense>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<SectionSkeleton height="h-32" />}>
          <UpcomingPeriodCard userId={userId} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton height="h-32" />}>
          <PastPeriodsCard userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}
