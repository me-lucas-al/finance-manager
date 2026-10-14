'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/app/actions/password';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { ResetSuccess } from './ResetSuccess';
import { ResetTokenMissing } from './ResetTokenMissing';

const REDIRECT_DELAY_MS = 2000;

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token') || '';

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function action(formData: FormData) {
    setError(null);
    if (formData.get('password') !== formData.get('confirmPassword')) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      formData.set('token', token);
      const result = await resetPassword(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (!result.success) return;
      setSuccess(true);
      setTimeout(() => router.push('/login'), REDIRECT_DELAY_MS);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Erro ao redefinir a senha');
    }
  }

  if (!token) return <ResetTokenMissing />;
  if (success) return <ResetSuccess />;

  return (
    <form action={(data) => startTransition(() => action(data))} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reset-password">Nova Senha</Label>
        <PasswordInput id="reset-password" name="password" minLength={6} placeholder="Mínimo 6 caracteres" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reset-confirm-password">Confirmar Nova Senha</Label>
        <PasswordInput
          id="reset-confirm-password"
          name="confirmPassword"
          minLength={6}
          placeholder="Repita a nova senha"
          required
        />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Redefinindo...' : 'Redefinir senha'}
      </Button>
    </form>
  );
}
