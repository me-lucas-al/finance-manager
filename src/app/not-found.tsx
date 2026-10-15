import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] p-8 bg-background">
      <div className="max-w-md w-full flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <SearchX className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Página não encontrada</h2>
          <p className="text-muted-foreground">
            O endereço que você abriu não existe ou não está mais disponível.
          </p>
        </div>
        <Link href="/" className={buttonVariants()}>
          Ir para o Overview
        </Link>
      </div>
    </div>
  );
}
