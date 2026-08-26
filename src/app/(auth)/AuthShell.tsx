import type { ReactNode } from 'react';
import { Logo } from '@/components/Logo';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 ledger-rule">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--primary) 22%, transparent), transparent)',
        }}
      />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6">
        <Logo className="text-foreground" markClassName="h-10 w-10" />
        {children}
      </div>
    </div>
  );
}
