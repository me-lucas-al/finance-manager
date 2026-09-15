import { Landmark } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { bankAccentClass, bankLabel, itemStatusPresentation } from './bank-style';
import type { BankConnection } from './group-accounts';

function formatLastSynced(lastSyncedAt: string | null): string {
  if (!lastSyncedAt) return 'Nunca sincronizado';
  return `Sincronizado em ${new Date(lastSyncedAt).toLocaleDateString('pt-BR')}`;
}

export function BankConnectionCard({ connection }: { connection: BankConnection }) {
  const status = itemStatusPresentation(connection.itemStatus);

  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${bankAccentClass(connection.bank)}`}>
          <Landmark className="size-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{bankLabel(connection.bank)}</p>
          <p className="text-xs text-muted-foreground">
            {connection.accountCount} conta{connection.accountCount === 1 ? '' : 's'} · {formatLastSynced(connection.lastSyncedAt)}
          </p>
        </div>
        <Badge variant={status.variant} className={status.className}>{status.label}</Badge>
      </CardContent>
    </Card>
  );
}
