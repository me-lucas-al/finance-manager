import type { ReactNode } from 'react';

export function OverviewCardLabel({ icon, children }: { icon: ReactNode; children: string }) {
  return (
    <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
      {icon}
      <span>{children}</span>
    </div>
  );
}
