import type { FixedEntryStatus } from '@/modules/finance/domain/models/fixed-entry';

const STATUS_STYLE: Record<FixedEntryStatus, { label: string; className: string }> = {
  launched: { label: 'Lançado', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  scheduled: { label: 'Agendado', className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  skipped: { label: 'Não lançado', className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30' },
  paused: { label: 'Pausado', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
};

export function FixedEntryStatusBadge({ status }: { status: FixedEntryStatus }) {
  const { label, className } = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${className}`}>
      {label}
    </span>
  );
}
