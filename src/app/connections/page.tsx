import { auth } from '@/auth';
import { Landmark } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SupabaseAccountRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import { BankConnectionCard } from '@/components/connections/BankConnectionCard';
import { groupAccountsByItem } from '@/components/connections/group-accounts';
import { OpenFinanceConnect } from './OpenFinanceConnect';

export default async function ConnectionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="p-8">Acesso negado</div>;
  }
  const userId = session.user.id;

  const accounts = await new SupabaseAccountRepository().findAllByUserId(userId).catch(() => []);
  const connections = groupAccountsByItem(accounts);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 bg-background min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-4 space-y-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Open Finance</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Conexões</h2>
        </div>
        <OpenFinanceConnect />
      </div>

      {connections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Landmark className="size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Nenhum banco conectado ainda</p>
            <p className="text-sm text-muted-foreground">
              Conecte uma conta acima para importar transações automaticamente via Pluggy.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((connection) => (
            <BankConnectionCard key={connection.pluggyItemId} connection={connection} />
          ))}
        </div>
      )}
    </div>
  );
}
