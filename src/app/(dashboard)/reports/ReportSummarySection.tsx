import { Card, CardContent } from '@/components/ui/card';
import { getReportSummary } from './get-report-summary';
import { SummaryCards } from './SummaryCards';

interface ReportSectionProps {
  userId: string;
  period: string;
}

export async function ReportSummarySection({ userId, period }: ReportSectionProps) {
  const { noDataMessage, metrics } = await getReportSummary(userId, period);

  if (noDataMessage) {
    return (
      <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl">
        <CardContent className="p-8 text-center text-xs text-zinc-400 font-sans">{noDataMessage}</CardContent>
      </Card>
    );
  }

  return <SummaryCards metrics={metrics} />;
}
