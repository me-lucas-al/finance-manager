import { Mail, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileFieldsProps {
  name: string;
  email: string;
  onNameChange: (name: string) => void;
}

export function ProfileFields({ name, email, onNameChange }: ProfileFieldsProps) {
  return (
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
            onChange={(event) => onNameChange(event.target.value)}
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
  );
}
