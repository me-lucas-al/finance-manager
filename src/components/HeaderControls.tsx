'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Filter, Eye, EyeOff, Sun, ChevronDown, Check, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePrivacy } from '@/components/PrivacyProvider';
import { signOut } from '@/app/actions/auth';

interface HeaderControlsProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function HeaderControls({ user }: HeaderControlsProps) {
  const { isPrivate, togglePrivacy } = usePrivacy();
  const [selectedConnection, setSelectedConnection] = React.useState('Todas conexões');
  const [language, setLanguage] = React.useState<'US EN' | 'PT BR'>('US EN');

  const connectionOptions = [
    'Todas conexões',
    'Itaú',
    'Nubank',
    'Inter',
  ];

  return (
    <div className="flex items-center gap-2 md:gap-4">
      {/* Conexões Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700/40 rounded-lg px-2.5"
          >
            <Filter className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden sm:inline">{selectedConnection}</span>
            <ChevronDown className="h-3 w-3 text-zinc-500" />
          </Button>
        } />
        <DropdownMenuContent align="end" className="w-48 bg-[#121318] border-zinc-800 text-zinc-200">
          <DropdownMenuLabel className="text-xs text-zinc-400">Filtrar por conexão</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-800" />
          {connectionOptions.map((opt) => (
            <DropdownMenuItem
              key={opt}
              onClick={() => setSelectedConnection(opt)}
              className="flex items-center justify-between text-xs cursor-pointer hover:bg-zinc-800 hover:text-white"
            >
              {opt}
              {selectedConnection === opt && <Check className="h-3.5 w-3.5 text-blue-500" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Language Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 px-2 rounded-lg"
          >
            {language}
          </Button>
        } />
        <DropdownMenuContent align="end" className="w-32 bg-[#121318] border-zinc-800 text-zinc-200">
          <DropdownMenuItem
            onClick={() => setLanguage('US EN')}
            className="text-xs cursor-pointer hover:bg-zinc-800 hover:text-white"
          >
            US EN
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setLanguage('PT BR')}
            className="text-xs cursor-pointer hover:bg-zinc-800 hover:text-white"
          >
            PT BR
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Privacy Mode Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePrivacy}
        title={isPrivate ? 'Mostrar valores' : 'Ocultar valores'}
        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg"
      >
        {isPrivate ? <EyeOff className="h-4 w-4 text-blue-400" /> : <Eye className="h-4 w-4" />}
        <span className="sr-only">Modo Privacidade</span>
      </Button>

      {/* Theme Toggle (dark by default per reference) */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg"
        title="Alternar tema"
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Tema</span>
      </Button>

      {/* User Avatar with Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <button className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-zinc-700 transition outline-none">
            <Avatar className="h-8 w-8 border border-zinc-700/60">
              <AvatarImage src={user?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'} alt={user?.name || 'User'} />
              <AvatarFallback className="bg-zinc-800 text-zinc-200 text-xs font-semibold">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3 w-3 text-zinc-400 hidden sm:block" />
          </button>
        } />
        <DropdownMenuContent align="end" className="w-56 bg-[#121318] border-zinc-800 text-zinc-200 shadow-xl">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-white">{user?.name || 'Usuário'}</p>
              <p className="text-xs leading-none text-zinc-400">{user?.email || 'usuario@pluggy.ai'}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem render={<Link href="/settings" className="flex items-center gap-2 cursor-pointer w-full text-xs hover:bg-zinc-800 hover:text-white py-2" />}>
            <Settings className="h-3.5 w-3.5 text-zinc-400" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem
            onClick={() => signOut()}
            className="flex items-center gap-2 text-xs text-red-400 cursor-pointer hover:bg-zinc-800 hover:text-red-300 py-2"
          >
            <LogOut className="h-3.5 w-3.5 text-red-400" />
            Sair da conta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
