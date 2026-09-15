import { auth } from '@/auth';
import { Card, CardContent } from '@/components/ui/card';
import { ReportFilters } from './ReportFilters';
import { SummaryCards } from './SummaryCards';
import { ReportCharts } from './ReportCharts';
import { getReportData, type Range } from './get-report-data';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id ?? process.env.FINANCE_OWNER_USER_ID ?? '3dd11c4e-e3c6-4a97-adb4-431ca7f476f1';

  const { range: rawRange } = await searchParams;
  const range: Range = rawRange === 'last' || rawRange === 'all' ? rawRange : 'current';

  const data = await getReportData(userId, range);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 bg-background min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Relatórios</h2>
      </div>

      <ReportFilters range={range} />

      {data.noDataMessage ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">{data.noDataMessage}</CardContent>
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
  );
}
