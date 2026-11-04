import { cn } from '@/lib/utils';
import type { BankConnectionHealth } from '@/modules/open-finance/domain/connected-bank';

const HEALTH_STYLE: Record<BankConnectionHealth, { label: string; badge: string; dot: string }> = {
  healthy: { label: 'Conectado', badge: 'border-emerald-900/60 bg-emerald-950/40 text-emerald-400', dot: 'bg-emerald-400' },
  updating: { label: 'Atualizando', badge: 'border-amber-900/60 bg-amber-950/40 text-amber-400', dot: 'bg-amber-400' },
  attention: { label: 'Reconectar', badge: 'border-red-900/60 bg-red-950/40 text-red-400', dot: 'bg-red-500' },
};

export function BankHealthBadge({ health }: { health: BankConnectionHealth }) {
  const style = HEALTH_STYLE[health];
  return (
    <span
      role="status"
      className={cn('inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium', style.badge)}
    >
      <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', style.dot)} />
      {style.label}
    </span>
  );
}
