'use client';

import React, { useState } from 'react';
import { User, Mail, ShieldCheck, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { updateUserProfile } from '@/app/actions/users';

interface ProfileFormProps {
  initialName: string;
  email: string;
  createdAt?: string;
}

export function ProfileForm({ initialName, email, createdAt }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateUserProfile(name);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Erro ao atualizar perfil.');
    } finally {
      setIsSaving(false);
    }
  }

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Agosto de 2026';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-4 border-b border-zinc-800">
        <Avatar className="h-16 w-16 border-2 border-blue-600/50 shadow-md">
          <AvatarImage src="" alt={name} />
          <AvatarFallback className="bg-blue-950 text-blue-300 text-lg font-bold border border-blue-800/60">
            {initials}
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
          <p className="text-xs text-zinc-400">Membro desde {formattedDate}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="profile-name" className="text-xs font-medium text-zinc-300">
            Nome Completo
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-9 bg-zinc-900/60 border-zinc-800 text-zinc-100 text-sm focus:border-blue-500"
              placeholder="Seu nome completo"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-email" className="text-xs font-medium text-zinc-300">
            E-mail Cadastrado
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              id="profile-email"
              value={email}
              disabled
              className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-400 text-sm cursor-not-allowed opacity-80"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs font-medium text-blue-400 bg-blue-950/30 border border-blue-800/40 p-2.5 rounded-lg">
          {error}
        </p>
      )}

      {success && (
        <div className="flex items-center gap-2 text-xs font-medium text-blue-400 bg-blue-950/30 border border-blue-800/40 p-2.5 rounded-lg">
          <Check className="h-4 w-4 text-blue-400" />
          <span>Perfil atualizado com sucesso!</span>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 h-9 rounded-lg transition"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Perfil'
          )}
        </Button>
      </div>
    </form>
  );
}
