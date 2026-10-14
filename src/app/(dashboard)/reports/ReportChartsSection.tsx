import { getReportCharts } from './get-report-charts';
import { ReportCharts } from './ReportCharts';

export async function ReportChartsSection({ userId, period }: { userId: string; period: string }) {
  const charts = await getReportCharts(userId, period);

  return <ReportCharts {...charts} />;
}
