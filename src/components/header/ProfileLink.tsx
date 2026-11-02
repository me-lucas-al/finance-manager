import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toInitials } from '@/lib/format';
import type { HeaderUser } from '@/types/user';

export function ProfileLink({ user }: { user: HeaderUser }) {
  return (
    <Link
      href="/profile"
      aria-label="Abrir meu perfil"
      className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-800/60 transition outline-none group"
    >
      <Avatar className="h-8 w-8 border border-zinc-700/80 group-hover:border-blue-500/60 transition">
        <AvatarImage src={user.image || ''} alt={user.name} />
        <AvatarFallback className="bg-blue-950/80 text-blue-300 border border-blue-800/50 text-xs font-semibold">
          {toInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs font-medium text-zinc-300 group-hover:text-white hidden sm:inline">{user.name}</span>
      <ChevronRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200" />
    </Link>
  );
}
