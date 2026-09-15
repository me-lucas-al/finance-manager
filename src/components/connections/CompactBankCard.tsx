import Link from 'next/link';
import { Landmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { bankAccentClass, bankLabel, itemStatusPresentation } from './bank-style';
import type { BankConnection } from './group-accounts';

export function CompactBankCard({ connection }: { connection: BankConnection }) {
  const status = itemStatusPresentation(connection.itemStatus);

  return (
    <Link
      href="/connections"
      className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted/50"
    >
      <div className={`flex size-7 shrink-0 items-center justify-center rounded-md ${bankAccentClass(connection.bank)}`}>
        <Landmark className="size-3.5 text-white" />
      </div>
      <span className="min-w-0 flex-1 truncate font-medium text-foreground">{bankLabel(connection.bank)}</span>
      <Badge variant={status.variant} className={status.className}>{status.label}</Badge>
    </Link>
  );
}
