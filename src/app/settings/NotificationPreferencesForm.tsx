'use client';

import { useState, useTransition } from 'react';
import { updateNotificationPreferences } from '@/app/actions/notification-preferences';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface NotificationPreferencesFormProps {
  expenseNotificationsEnabled: boolean;
  investmentNotificationsEnabled: boolean;
  goalNotificationsEnabled: boolean;
  closingNotificationsEnabled: boolean;
  generalNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
}

const FIELDS: { name: keyof NotificationPreferencesFormProps; label: string }[] = [
  { name: 'expenseNotificationsEnabled', label: 'Avisos de gastos' },
  { name: 'investmentNotificationsEnabled', label: 'Avisos de investimento' },
  { name: 'goalNotificationsEnabled', label: 'Progresso da meta' },
  { name: 'closingNotificationsEnabled', label: 'Fechamento de período' },
  { name: 'generalNotificationsEnabled', label: 'Avisos gerais' },
  { name: 'pushNotificationsEnabled', label: 'Notificações push' },
];

export function NotificationPreferencesForm(props: NotificationPreferencesFormProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  async function action(formData: FormData) {
    setSaved(false);
    await updateNotificationPreferences(formData);
    setSaved(true);
  }

  return (
    <form action={(data) => startTransition(() => action(data))} className="space-y-4">
      <div className="space-y-3">
        {FIELDS.map((field) => (
          <label key={field.name} htmlFor={field.name} className="flex items-center justify-between gap-4">
            <Label htmlFor={field.name} className="font-normal">{field.label}</Label>
            <input
              id={field.name}
              name={field.name}
              type="checkbox"
              defaultChecked={props[field.name]}
              value="true"
              className="h-4 w-4 rounded border-border accent-primary"
            />
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar preferências'}
        </Button>
        {saved && <span className="text-sm text-emerald-500">Salvo com sucesso.</span>}
      </div>
    </form>
  );
}
