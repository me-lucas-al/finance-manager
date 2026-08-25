'use client';

import { useState, useTransition } from 'react';
import { changePassword } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function action(formData: FormData) {
    setError(null);
    setSuccess(false);

    const newPassword = formData.get('newPassword') as string;
    const confirmNewPassword = formData.get('confirmNewPassword') as string;

    if (newPassword !== confirmNewPassword) {
      setError('A confirmação não coincide com a nova senha');
      return;
    }

    try {
      const result = await changePassword(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(true);
        const form = document.getElementById('change-password-form') as HTMLFormElement;
        form?.reset();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar a senha');
    }
  }

  return (
    <form
      id="change-password-form"
      action={(data) => startTransition(() => action(data))}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="current-password">Senha Atual</Label>
        <PasswordInput
          id="current-password"
          name="currentPassword"
          placeholder="Sua senha atual"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="change-new-password">Nova Senha</Label>
        <PasswordInput
          id="change-new-password"
          name="newPassword"
          minLength={6}
          placeholder="Mínimo 6 caracteres"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="change-confirm-new-password">Confirmar Nova Senha</Label>
        <PasswordInput
          id="change-confirm-new-password"
          name="confirmNewPassword"
          minLength={6}
          placeholder="Repita a nova senha"
          required
        />
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {success && (
        <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">
          Senha alterada com sucesso!
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Alterar Senha'}
      </Button>
    </form>
  );
}
