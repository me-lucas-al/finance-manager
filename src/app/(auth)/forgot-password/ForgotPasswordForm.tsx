'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/app/actions/auth';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await requestPasswordReset(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccessMessage(result.message || 'Se este email estiver cadastrado, enviamos um link para redefinição da sua senha.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar recuperação de senha');
    }
  }

  return (
    <div className="space-y-4">
      {successMessage ? (
        <div className="space-y-4">
          <div role="status" className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm">
            {successMessage}
          </div>

          <Link
            href="/login"
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
          >
            Voltar para o login
          </Link>
        </div>
      ) : (
        <form action={(data) => startTransition(() => action(data))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
          </div>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Enviando...' : 'Enviar instruções'}
          </Button>
        </form>
      )}
    </div>
  );
}
