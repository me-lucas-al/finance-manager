'use client';

import type { ReactNode } from 'react';
import { setFixedEntryActiveAction } from '@/app/actions/fixed-entries';
import type { FixedEntryView } from '@/modules/finance/domain/models/fixed-entry';
import type { FixedEntriesSummary } from '@/modules/finance/domain/services/summarize-fixed-entries';
import { FixedEntriesDialogs } from './FixedEntriesDialogs';
import { FixedEntriesSummaryBar } from './FixedEntriesSummaryBar';
import { FixedEntryRow } from './FixedEntryRow';
import { NewFixedEntryButton } from './NewFixedEntryButton';
import { useFixedEntryActions } from './useFixedEntryActions';
import { useFixedEntryDialogs } from './useFixedEntryDialogs';

type FixedEntriesPanelProps = {
  views: FixedEntryView[];
  summary?: FixedEntriesSummary;
  headerLink?: ReactNode;
};

export function FixedEntriesPanel({ views, summary, headerLink }: FixedEntriesPanelProps) {
  const dialogs = useFixedEntryDialogs();
  const { error, run } = useFixedEntryActions();

  const toggleActive = (entry: FixedEntryView) =>
    run(() => setFixedEntryActiveAction({ id: entry.id, active: !entry.active }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Fixos do mês</h2>
          {headerLink}
        </div>
        <NewFixedEntryButton onCreate={dialogs.openCreate} />
      </div>
      {summary && <FixedEntriesSummaryBar summary={summary} />}
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {views.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum lançamento fixo cadastrado ainda.</p>
      ) : (
        <ul>
          {views.map((entry) => (
            <FixedEntryRow
              key={entry.id}
              entry={entry}
              onEdit={dialogs.openEdit}
              onToggleActive={toggleActive}
              onDelete={dialogs.openDelete}
            />
          ))}
        </ul>
      )}
      <FixedEntriesDialogs dialog={dialogs.dialog} onClose={dialogs.close} />
    </div>
  );
}
