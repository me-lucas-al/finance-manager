import { getEffectiveUserId } from '@/app/actions/require-session';
import { Card, CardContent } from '@/components/ui/card';
import { ReportFilters } from './ReportFilters';
import { SummaryCards } from './SummaryCards';
import { ReportCharts } from './ReportCharts';
import { getReportData } from './get-report-data';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; period?: string; bank?: string }>;
}) {
  const userId = await getEffectiveUserId();
  const resolvedParams = await searchParams;

  const period = resolvedParams.period || resolvedParams.range || '2026-09';
  const bank = resolvedParams.bank || 'all';

  const data = await getReportData(userId, { period, bank });

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Relatórios Financeiros</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Análise consolidada de receitas, despesas, investimentos e metas com dados do Open Finance
            </p>
          </div>
        </div>

        <ReportFilters period={data.selectedPeriod} bank={data.selectedBank} />

        {data.noDataMessage ? (
          <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl">
            <CardContent className="p-8 text-center text-xs text-zinc-400 font-sans">
              {data.noDataMessage}
            </CardContent>
          </Card>
        ) : (
          <SummaryCards metrics={data.metrics} />
        )}

        <ReportCharts
          categoryData={data.categoryData}
          evolutionData={data.evolutionData}
          currentInvestmentPercentage={data.currentInvestmentPercentage}
          minInvestmentPercentage={data.minInvestmentPercentage}
          categoryVsGoalData={data.categoryVsGoalData}
        />
      </div>
    </div>
  );
}
