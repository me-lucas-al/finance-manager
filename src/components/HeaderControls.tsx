'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronDown, User, Settings, LogOut, Target, BarChart3, Calendar, Landmark } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/actions/auth';

interface HeaderControlsProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function HeaderControls({ user }: HeaderControlsProps) {
  const displayName = user?.name || 'Lucas Almeida';
  const displayEmail = user?.email || 'lucasalsouza2006@gmail.com';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      {/* User Profile Avatar with Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <button
            type="button"
            aria-label="Abrir menu de perfil do usuário"
            className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-800/60 transition outline-none cursor-pointer group"
          >
            <Avatar className="h-8 w-8 border border-zinc-700/80 group-hover:border-blue-500/60 transition">
              <AvatarImage src={user?.image || ''} alt={displayName} />
              <AvatarFallback className="bg-blue-950/80 text-blue-300 border border-blue-800/50 text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-zinc-300 group-hover:text-white hidden sm:inline">
              {displayName}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200" />
          </button>
        } />
        <DropdownMenuContent align="end" className="w-60 bg-[#121318] border-zinc-800 text-zinc-200 shadow-2xl p-1.5">
          <DropdownMenuLabel className="font-normal px-3 py-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none text-white">{displayName}</p>
              <p className="text-xs leading-none text-zinc-400 truncate">{displayEmail}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem render={<Link href="/settings" className="flex items-center gap-2.5 cursor-pointer w-full text-xs hover:bg-zinc-800 hover:text-white py-2 px-3 rounded-md transition" />}>
            <User className="h-4 w-4 text-blue-400" />
            <span>Meu Perfil & Configurações</span>
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/connections" className="flex items-center gap-2.5 cursor-pointer w-full text-xs hover:bg-zinc-800 hover:text-white py-2 px-3 rounded-md transition" />}>
            <Landmark className="h-4 w-4 text-zinc-400" />
            <span>Conexões Bancárias</span>
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/goals" className="flex items-center gap-2.5 cursor-pointer w-full text-xs hover:bg-zinc-800 hover:text-white py-2 px-3 rounded-md transition" />}>
            <Target className="h-4 w-4 text-zinc-400" />
            <span>Metas</span>
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/reports" className="flex items-center gap-2.5 cursor-pointer w-full text-xs hover:bg-zinc-800 hover:text-white py-2 px-3 rounded-md transition" />}>
            <BarChart3 className="h-4 w-4 text-zinc-400" />
            <span>Relatórios</span>
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/periods" className="flex items-center gap-2.5 cursor-pointer w-full text-xs hover:bg-zinc-800 hover:text-white py-2 px-3 rounded-md transition" />}>
            <Calendar className="h-4 w-4 text-zinc-400" />
            <span>Calendário Financeiro</span>
          </DropdownMenuItem>
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
