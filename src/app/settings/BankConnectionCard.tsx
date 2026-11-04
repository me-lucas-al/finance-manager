import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectedBanksList } from '@/components/banks/ConnectedBanksList';
import { getConnectedBanks } from '@/app/actions/connected-banks';
import { ConnectAnotherBank } from './ConnectAnotherBank';

export async function BankConnectionCard() {
  const banks = await getConnectedBanks();

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Bancos conectados (Pluggy)</CardTitle>
        <CardDescription>
          Receitas, despesas e investimentos são importados dos seus bancos. Lançamentos manuais complementam o que vem deles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ConnectedBanksList banks={banks} />
        <div className="flex justify-center sm:justify-start">
          <ConnectAnotherBank hasBanks={(banks?.length ?? 0) > 0} />
        </div>
      </CardContent>
    </Card>
  );
}
