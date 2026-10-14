import { ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toInitials } from '@/lib/format';
import { formatMemberSince } from './profile-format';

interface ProfileHeaderProps {
  name: string;
  createdAt?: string;
}

export function ProfileHeader({ name, createdAt }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-4 border-b border-zinc-800">
      <Avatar className="h-16 w-16 border-2 border-blue-600/50 shadow-md">
        <AvatarImage src="" alt={name} />
        <AvatarFallback className="bg-blue-950 text-blue-300 text-lg font-bold border border-blue-800/60">
          {toInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-white">{name}</h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-950/80 text-blue-400 border border-blue-800/60 px-2 py-0.5 rounded-full">
            <ShieldCheck className="h-3 w-3 text-blue-400" />
            Titular da Conta
          </span>
        </div>
        {createdAt && <p className="text-xs text-zinc-400">Membro desde {formatMemberSince(createdAt)}</p>}
      </div>
    </div>
  );
}
