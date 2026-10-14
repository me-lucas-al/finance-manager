import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  icon: ReactNode;
  borderClass: string;
  value: string;
  caption: string;
}

export function MetricCard({ title, icon, borderClass, value, caption }: MetricCardProps) {
  return (
    <Card className={`bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm border-l-4 ${borderClass}`}>
      <CardHeader className="pb-2 pt-5 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="text-2xl font-bold tracking-tight text-white font-sans">{value}</div>
        <p className="text-xs text-zinc-400 mt-1">{caption}</p>
      </CardContent>
    </Card>
  );
}
