import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ModeCardProps = {
  icon: LucideIcon;
  title: string;
  tagline: string;
  selected: boolean;
  onSelect: () => void;
  testId: string;
};

export function ModeCard({ icon: Icon, title, tagline, selected, onSelect, testId }: ModeCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      data-testid={testId}
      aria-pressed={selected}
      className={cn(
        'flex flex-1 flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all',
        selected
          ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/40'
          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-600',
      )}
    >
      <Icon className={cn('h-6 w-6', selected ? 'text-blue-400' : 'text-zinc-400')} />
      <span className="text-sm font-semibold text-white">{title}</span>
      <span className="text-xs text-zinc-400">{tagline}</span>
    </button>
  );
}
