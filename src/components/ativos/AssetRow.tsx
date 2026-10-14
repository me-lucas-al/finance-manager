'use client';

import { useState } from 'react';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Amount } from '@/components/shared/Amount';
import type { LiveAssetItem } from '@/modules/finance/domain/models/financial-types';
import { AssetBankTag } from './AssetBankTag';
import { AssetDetails } from './AssetDetails';

export function AssetRow({ asset }: { asset: LiveAssetItem }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const ChevronIcon = isExpanded ? ChevronUp : ChevronDown;

  return (
    <div className="transition-colors hover:bg-zinc-800/30">
      <button
        type="button"
        aria-expanded={isExpanded}
        className="w-full px-6 py-4 flex items-center justify-between cursor-pointer group outline-none focus-visible:bg-zinc-800/50 text-left"
        onClick={() => setIsExpanded((current) => !current)}
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-4">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
            <TrendingUp className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white group-hover:text-zinc-100 truncate max-w-[280px] sm:max-w-md md:max-w-lg lg:max-w-2xl">
              {asset.name}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
              <AssetBankTag bank={asset.bank} bankName={asset.bankName} />
              <span>
                {asset.bankName} · {asset.type}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0 text-right">
          <div>
            <Amount value={asset.amount} className="block text-sm font-semibold text-emerald-400" />
            <p className="text-xs text-zinc-500">{asset.percentage.toFixed(1)}%</p>
          </div>
          <ChevronIcon className="h-4 w-4 text-zinc-500" />
        </div>
      </button>
      {isExpanded && <AssetDetails asset={asset} />}
    </div>
  );
}
