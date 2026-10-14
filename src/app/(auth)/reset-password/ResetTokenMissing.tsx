import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ResetTokenMissing() {
  return (
    <div className="space-y-4">
      <p role="alert" className="text-sm text-destructive">
        Token de redefinição não encontrado ou inválido.
      </p>
      <Link href="/forgot-password" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
        Solicitar novo link
      </Link>
    </div>
  );
}
