import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getUserSettings } from '@/app/actions/users';
import { SettingsForm } from './SettingsForm';

export async function RulesCard() {
  const settings = await getUserSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regras Financeiras</CardTitle>
        <CardDescription>Defina o ciclo do seu período e as metas de gastos e investimentos.</CardDescription>
      </CardHeader>
      <CardContent>
        {!settings && <p className="text-sm text-zinc-400">Configurações não encontradas.</p>}
        {settings && (
          <SettingsForm
            periodStartDay={settings.periodStartDay}
            periodEndDay={settings.periodEndDay}
            maxExpensesPercentage={settings.maxExpensesPercentage}
            minInvestmentPercentage={settings.minInvestmentPercentage}
            initialBalance={settings.initialBalance}
            expenseCategories={settings.expenseCategories ?? []}
            investmentTypes={settings.investmentTypes ?? []}
          />
        )}
      </CardContent>
    </Card>
  );
}
