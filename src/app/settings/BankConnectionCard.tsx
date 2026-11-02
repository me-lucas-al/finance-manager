import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectBankButton } from '@/components/onboarding/ConnectBankButton';

export function BankConnectionCard() {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Banco (Pluggy)</CardTitle>
        <CardDescription>
          Receitas, despesas e investimentos são importados do seu banco. Lançamentos manuais complementam o que vem do banco.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ConnectBankButton label="Conectar outro banco" />
      </CardContent>
    </Card>
  );
}
