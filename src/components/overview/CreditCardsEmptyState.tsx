import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CreditCardsEmptyState() {
  return (
    <div className="flex flex-col items-start gap-3 py-2">
      <p className="text-sm text-zinc-400">Você ainda não cadastrou nenhum cartão.</p>
      <Button render={<Link href="/cards" />} size="sm" variant="outline">
        Cadastrar cartão
      </Button>
    </div>
  );
}
