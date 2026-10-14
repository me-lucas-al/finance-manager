import { Suspense } from 'react';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import { getCurrentMonth } from '@/lib/month';
import { ReportChartsSection } from './ReportChartsSection';
import { ReportFilters } from './ReportFilters';
import { ReportSkeleton } from './ReportSkeleton';
import { ReportSummarySection } from './ReportSummarySection';
import { resolveReportPeriod } from './resolve-report-period';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; period?: string }>;
}) {
  const userId = await requireUserId();
  const { period: requestedPeriod, range } = await searchParams;
  const period = resolveReportPeriod(requestedPeriod || range, getCurrentMonth());

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Relatórios Financeiros</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Análise consolidada de receitas, despesas, investimentos e metas dos seus lançamentos
          </p>
        </div>

        <ReportFilters period={period} />

        <Suspense fallback={<ReportSkeleton height="h-28" />}>
          <ReportSummarySection userId={userId} period={period} />
        </Suspense>

        <Suspense fallback={<ReportSkeleton height="h-80" />}>
          <ReportChartsSection userId={userId} period={period} />
        </Suspense>
      </div>
    </div>
  );
}
