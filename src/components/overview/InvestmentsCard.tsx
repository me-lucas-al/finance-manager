'use client';

import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Amount } from '@/components/shared/Amount';
import type { InvestmentOverview } from '@/types/overview';
import { InvestmentClassesView } from './InvestmentClassesView';
import { InvestmentInstitutionsView } from './InvestmentInstitutionsView';
import { InvestmentViewToggle, type InvestmentView } from './InvestmentViewToggle';
import { OverviewCardLabel } from './OverviewCardLabel';

function describeView(view: InvestmentView, investments: InvestmentOverview): string {
  if (view === 'classes') return `1 classes · ${investments.count} ativos (${investments.subtitle})`;
  return `${investments.institutions?.length ?? 0} instituições · ${investments.count} ativos`;
}

export function InvestmentsCard({ investments }: { investments: InvestmentOverview }) {
  const [view, setView] = useState<InvestmentView>('classes');

  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm hover:border-zinc-700/60 transition-colors">
      <CardHeader className="pb-3 pt-5 px-6">
        <div className="flex items-center justify-between">
          <OverviewCardLabel icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}>
            INVESTIMENTOS
          </OverviewCardLabel>
          <InvestmentViewToggle activeView={view} onChange={setView} />
        </div>
        <div className="mt-2">
          <Amount value={investments.total} className="text-3xl font-bold tracking-tight text-emerald-400" />
        </div>
        <p className="text-xs text-zinc-500 mt-1">{describeView(view, investments)}</p>
      </CardHeader>
      <CardContent className="px-6 pb-5 pt-3">
        {view === 'classes' ? (
          <InvestmentClassesView count={investments.count} total={investments.total} />
        ) : (
          <InvestmentInstitutionsView institutions={investments.institutions ?? []} />
        )}
      </CardContent>
    </Card>
  );
}
