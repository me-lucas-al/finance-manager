import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ResetSuccess() {
  return (
    <div className="space-y-4 text-center">
      <div role="status" className="p-3 bg-positive/10 text-positive rounded-lg text-sm">
        Senha redefinida com sucesso! Redirecionando para o login...
      </div>
      <Link href="/login" className={cn(buttonVariants({ variant: 'default' }), 'w-full')}>
        Ir para o login
      </Link>
    </div>
  );
}
