import { formatCurrency } from '@/lib/format';
import type { FixedEntry, FixedEntryStatus, FixedEntryView } from '../../domain/models/fixed-entry';
import type { FixedEntriesSummary } from '../../domain/services/summarize-fixed-entries';

const LAUNCH_LABEL: Record<FixedEntry['kind'], string> = {
  expense: '📌 Gasto fixo lançado',
  income: '📌 Receita fixa lançada',
};

const STATUS_LABEL: Record<FixedEntryStatus, string> = {
  launched: '✅ lançado',
  scheduled: '⏳ agendado',
  skipped: '➖ não lançado',
  paused: '⏸ pausado',
};

export function formatFixedLaunchMessage(entry: FixedEntry): string {
  return `${LAUNCH_LABEL[entry.kind]}: ${entry.description} — ${formatCurrency(entry.amount)}`;
}

function formatFixedEntryLine(view: FixedEntryView): string {
  const day = view.dueDate.slice(8, 10);
  const sign = view.kind === 'income' ? '+' : '-';
  return `• dia ${day} · ${view.description} ${sign}${formatCurrency(view.amount)} (${STATUS_LABEL[view.status]})`;
}

export function formatFixedEntriesMessage(views: FixedEntryView[], summary: FixedEntriesSummary): string {
  if (views.length === 0) return 'Você ainda não tem lançamentos fixos. Peça, por exemplo: "assino Netflix 39,90 todo dia 5".';
  return [
    '📌 Fixos do mês',
    ...views.map(formatFixedEntryLine),
    '',
    `Lançados ${summary.launchedCount} de ${summary.totalCount}`,
    `Saldo projetado: ${formatCurrency(summary.projectedBalance)}`,
  ].join('\n');
}
