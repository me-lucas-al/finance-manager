import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChangePasswordForm } from './ChangePasswordForm';

export function SecurityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Segurança e Senha</CardTitle>
        <CardDescription>Altere a sua senha de acesso de forma segura.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChangePasswordForm />
      </CardContent>
    </Card>
  );
}
