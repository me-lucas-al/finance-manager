import { Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Amount } from '@/components/shared/Amount';

interface PortfolioSummaryCardProps {
  assetCount: number;
  total: number;
}

export function PortfolioSummaryCard({ assetCount, total }: PortfolioSummaryCardProps) {
  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm">
      <CardContent className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-950/40 border border-blue-800/40 flex items-center justify-center text-blue-500">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="font-semibold text-white text-base">Carteira ({assetCount} ativos)</span>
        </div>
        <Amount value={total} className="text-xl font-bold tracking-tight text-emerald-400" />
      </CardContent>
    </Card>
  );
}
