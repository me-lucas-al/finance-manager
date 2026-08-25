import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthShell } from '../AuthShell';
import { ResetPasswordForm } from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Criar Nova Senha</CardTitle>
          <CardDescription>
            Defina uma nova senha segura para a sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense fallback={<div className="text-sm text-muted-foreground text-center py-4">Carregando...</div>}>
            <ResetPasswordForm />
          </Suspense>
          <p className="text-center text-sm text-muted-foreground">
            Lembrou da senha anterior?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Voltar ao login
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
