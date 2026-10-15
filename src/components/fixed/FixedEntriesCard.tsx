import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { FixedEntriesOverview } from '@/modules/finance/application/services/fixed-entries-data-service';
import { FixedEntriesPanel } from './FixedEntriesPanel';

export function FixedEntriesCard({ overview }: { overview: FixedEntriesOverview }) {
  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm">
      <CardContent className="px-6 py-5">
        <FixedEntriesPanel
          views={overview.views}
          summary={overview.summary}
          headerLink={
            <Link href="/fixed-entries" className="text-xs text-blue-400 hover:text-blue-300">
              Ver todos
            </Link>
          }
        />
      </CardContent>
    </Card>
  );
}
