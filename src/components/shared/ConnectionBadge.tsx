import { cn } from '@/lib/utils';

export function WhatsappStatusBadge({ connected }: { connected: boolean }) {
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium',
        connected
          ? 'border-emerald-900/60 bg-emerald-950/40 text-emerald-400'
          : 'border-red-900/60 bg-red-950/40 text-red-400',
      )}
    >
      <span
        aria-hidden="true"
        data-testid="whatsapp-status-dot"
        className={cn('h-2 w-2 rounded-full', connected ? 'bg-emerald-400' : 'bg-red-500')}
      />
      {connected ? 'Conectado' : 'Desconectado'}
    </span>
  );
}
