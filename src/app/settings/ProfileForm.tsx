'use client';

import { useState, type FormEvent } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateUserProfile } from '@/app/actions/users';
import { ProfileFields } from './ProfileFields';
import { ProfileHeader } from './ProfileHeader';

const SUCCESS_VISIBLE_MS = 3000;

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateUserProfile(name);
      setSuccess(true);
      setTimeout(() => setSuccess(false), SUCCESS_VISIBLE_MS);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Erro ao atualizar perfil.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProfileHeader name={name} createdAt={createdAt} />
      <ProfileFields name={name} email={email} onNameChange={setName} />

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
          {isSaving && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
          {isSaving ? 'Salvando...' : 'Salvar Perfil'}
        </Button>
      </div>
    </form>
  );
}
