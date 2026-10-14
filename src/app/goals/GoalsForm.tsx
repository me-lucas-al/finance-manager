'use client';

import { useId, useTransition } from 'react';
import { saveMonthlyGoals } from '@/app/actions/goals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CategoryGoalFields } from './CategoryGoalFields';

interface GoalsFormProps {
  month: string;
  categories: string[];
  generalTargetAmount: number | null;
  categoryTargets: Record<string, number | null>;
}

export function GoalsForm({ month, categories, generalTargetAmount, categoryTargets }: GoalsFormProps) {
  const [isPending, startTransition] = useTransition();
  const idPrefix = useId();

  function action(formData: FormData) {
    startTransition(() => saveMonthlyGoals(month, formData));
  }

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-general`}>Meta geral (quanto pretende gastar no total)</Label>
        <Input
          id={`${idPrefix}-general`}
          name="general"
          type="number"
          step="0.01"
          placeholder="Ex: 4000"
          defaultValue={generalTargetAmount ?? undefined}
        />
      </div>
      <CategoryGoalFields idPrefix={idPrefix} categories={categories} categoryTargets={categoryTargets} />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar metas'}
      </Button>
    </form>
  );
}
