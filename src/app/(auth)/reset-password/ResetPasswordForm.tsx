'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/app/actions/auth';
import { Button, buttonVariants } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function action(formData: FormData) {
    setError(null);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      formData.set('token', token);
      const result = await resetPassword(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir a senha');
    }
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-destructive">
          Token de redefinição não encontrado ou inválido.
        </p>
        <Link
          href="/forgot-password"
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
        >
          Solicitar novo link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div role="status" className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm">
          Senha redefinida com sucesso! Redirecionando para o login...
        </div>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: 'default' }), 'w-full')}
        >
          Ir para o login
        </Link>
      </div>
    );
  }

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
