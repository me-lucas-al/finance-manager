import { Card, CardContent } from '@/components/ui/card';
import { Amount } from '@/components/shared/Amount';
import type { LiveAssetItem } from '@/modules/finance/domain/models/financial-types';
import { AssetRow } from './AssetRow';

interface FixedIncomeCardProps {
  assets: LiveAssetItem[];
  total: number;
}

export function FixedIncomeCard({ assets, total }: FixedIncomeCardProps) {
  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800/60 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">RENDA FIXA</span>
        <Amount value={total} className="text-xs font-medium text-zinc-400" />
      </div>
      <CardContent className="p-0 divide-y divide-zinc-800/50">
        {assets.map((asset) => (
          <AssetRow key={asset.id} asset={asset} />
        ))}
      </CardContent>
    </Card>
  );
}
