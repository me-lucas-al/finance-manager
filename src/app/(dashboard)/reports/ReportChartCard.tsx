import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReportChartCardProps {
  title: string;
  className?: string;
  children: ReactNode;
}

export function ReportChartCard({ title, className = '', children }: ReportChartCardProps) {
  return (
    <Card className={`bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm ${className}`}>
      <CardHeader className="pb-2 pt-5 px-6">
        <CardTitle className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">{children}</CardContent>
    </Card>
  );
}
