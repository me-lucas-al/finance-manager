import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function BackToPeriodsLink() {
  return (
    <Link
      href="/periods"
      className="inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar ao Calendário
    </Link>
  );
}
