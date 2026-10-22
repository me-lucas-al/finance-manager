import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WhatsappConnection } from '@/components/whatsapp/WhatsappConnection';

export function WhatsappCard({ initiallyConnected }: { initiallyConnected: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp</CardTitle>
        <CardDescription>Receba no WhatsApp o aviso das novas transações importadas do banco.</CardDescription>
      </CardHeader>
      <CardContent>
        <WhatsappConnection initiallyConnected={initiallyConnected} />
      </CardContent>
    </Card>
  );
}
