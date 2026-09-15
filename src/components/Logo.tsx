import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string; markClassName?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-1.5 transition-opacity hover:opacity-90', className)}>
      <span className="text-xl font-bold tracking-tight text-white select-none">
        meu<span className="text-zinc-400">.</span>pluggy
      </span>
    </Link>
  );
}
