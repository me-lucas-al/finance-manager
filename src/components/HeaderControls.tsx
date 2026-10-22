'use client';

import { User, LogOut, Target, BarChart3, Calendar, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/app/actions/auth';
import type { HeaderUser } from '@/types/user';
import { HeaderMenuLink } from './header/HeaderMenuLink';
import { UserMenuTrigger } from './header/UserMenuTrigger';

export function HeaderControls({ user }: { user: HeaderUser }) {
  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <UserMenuTrigger user={user} />
        <DropdownMenuContent align="end" className="w-60 bg-[#121318] border-zinc-800 text-zinc-200 shadow-2xl p-1.5">
          <DropdownMenuLabel className="font-normal px-3 py-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none text-white">{user.name}</p>
              <p className="text-xs leading-none text-zinc-400 truncate">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <HeaderMenuLink href="/profile" icon={<User className="h-4 w-4 text-blue-400" />} label="Meu Perfil" />
          <HeaderMenuLink href="/settings" icon={<Settings className="h-4 w-4 text-zinc-400" />} label="Configurações" />
          <HeaderMenuLink href="/goals" icon={<Target className="h-4 w-4 text-zinc-400" />} label="Metas" />
          <HeaderMenuLink href="/reports" icon={<BarChart3 className="h-4 w-4 text-zinc-400" />} label="Relatórios" />
          <HeaderMenuLink href="/periods" icon={<Calendar className="h-4 w-4 text-zinc-400" />} label="Calendário Financeiro" />
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem
            onClick={() => signOut()}
            className="flex items-center gap-2.5 text-xs text-blue-400 cursor-pointer hover:bg-zinc-800 hover:text-blue-300 py-2 px-3 rounded-md transition"
          >
            <LogOut className="h-4 w-4 text-blue-400" />
            <span>Sair da conta</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
