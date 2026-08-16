'use client';

import { useState, useTransition } from 'react';
import { updateUserSettings } from '@/app/actions/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SettingsFormProps {
  periodStartDay: number;
  periodEndDay: number;
  maxExpensesPercentage: number;
  minInvestmentPercentage: number;
  expenseCategories: string[];
  investmentTypes: string[];
}

export function SettingsForm(props: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState(props.expenseCategories.join(', '));
  const [investmentTypes, setInvestmentTypes] = useState(props.investmentTypes.join(', '));

  async function action(formData: FormData) {
    setSaved(false);
    formData.set('expenseCategories', JSON.stringify(splitList(expenseCategories)));
    formData.set('investmentTypes', JSON.stringify(splitList(investmentTypes)));
    await updateUserSettings(formData);
    setSaved(true);
  }

  function splitList(value: string): string[] {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return (
    <form action={(data) => startTransition(() => action(data))} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="periodStartDay">Dia de início do período</Label>
          <Input id="periodStartDay" name="periodStartDay" type="number" min={1} max={31} defaultValue={props.periodStartDay} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="periodEndDay">Dia de fechamento do período</Label>
          <Input id="periodEndDay" name="periodEndDay" type="number" min={1} max={31} defaultValue={props.periodEndDay} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxExpensesPercentage">Máximo de gastos (%)</Label>
          <Input id="maxExpensesPercentage" name="maxExpensesPercentage" type="number" min={0} max={100} defaultValue={props.maxExpensesPercentage} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minInvestmentPercentage">Mínimo de investimento (%)</Label>
          <Input id="minInvestmentPercentage" name="minInvestmentPercentage" type="number" min={0} max={100} defaultValue={props.minInvestmentPercentage} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expenseCategoriesInput">Categorias de despesa (separadas por vírgula)</Label>
        <Input
          id="expenseCategoriesInput"
          value={expenseCategories}
          onChange={(e) => setExpenseCategories(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="investmentTypesInput">Tipos de investimento (separados por vírgula)</Label>
        <Input
          id="investmentTypesInput"
          value={investmentTypes}
          onChange={(e) => setInvestmentTypes(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar regras'}
        </Button>
        {saved && <span className="text-sm text-emerald-500">Salvo com sucesso.</span>}
      </div>
    </form>
  );
}
