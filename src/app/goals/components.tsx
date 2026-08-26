'use client';

import { useId, useTransition } from 'react';
import { saveMonthlyGoals } from '@/app/actions/goals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GoalsFormProps {
  month: string;
  categories: string[];
  generalTargetAmount: number | null;
  categoryTargets: Record<string, number | null>;
}

export function GoalsForm({ month, categories, generalTargetAmount, categoryTargets }: GoalsFormProps) {
  const [isPending, startTransition] = useTransition();
  const uid = useId();

  function action(formData: FormData) {
    startTransition(() => saveMonthlyGoals(month, formData));
  }

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor={`${uid}-general`}>Meta geral (quanto pretende gastar no total)</Label>
        <Input
          id={`${uid}-general`}
          name="general"
          type="number"
          step="0.01"
          placeholder="Ex: 4000"
          defaultValue={generalTargetAmount ?? undefined}
        />
      </div>

      {categories.length > 0 && (
        <div className="space-y-2">
          <Label>Metas por categoria (opcional)</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <div key={category} className="space-y-1">
                <Label htmlFor={`${uid}-${category}`} className="text-xs text-muted-foreground">
                  {category}
                </Label>
                <Input
                  id={`${uid}-${category}`}
                  name={`category__${category}`}
                  type="number"
                  step="0.01"
                  defaultValue={categoryTargets[category] ?? undefined}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar metas'}
      </Button>
    </form>
  );
}
