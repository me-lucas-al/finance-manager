import type { LiveAssetItem } from '@/modules/finance/domain/models/financial-types';
import { FixedIncomeCard } from './FixedIncomeCard';
import { PortfolioSummaryCard } from './PortfolioSummaryCard';

interface AtivosListProps {
  initialTotal?: number;
  initialAssets?: LiveAssetItem[];
}

export function AtivosList({ initialTotal = 0, initialAssets = [] }: AtivosListProps) {
  return (
    <div className="space-y-6">
      <PortfolioSummaryCard assetCount={initialAssets.length} total={initialTotal} />
      <FixedIncomeCard assets={initialAssets} total={initialTotal} />
    </div>
  );
}
