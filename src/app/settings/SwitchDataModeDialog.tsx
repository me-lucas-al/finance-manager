'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { DataMode } from '@/modules/onboarding/application/choose-data-mode';
import { DATA_MODE_LABELS } from './data-mode-labels';
import { useSwitchDataMode } from './useSwitchDataMode';

type SwitchDataModeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMode: DataMode;
  targetMode: DataMode;
};

export function SwitchDataModeDialog({ open, onOpenChange, currentMode, targetMode }: SwitchDataModeDialogProps) {
  const switching = useSwitchDataMode(targetMode);
  const disconnectsBanks = currentMode === 'pluggy';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Isso apaga seus dados atuais
          </AlertDialogTitle>
          <AlertDialogDescription>
            Ao mudar para <strong>{DATA_MODE_LABELS[targetMode].name}</strong>, todas as receitas, despesas,
            investimentos, períodos{disconnectsBanks ? ' e os bancos conectados' : ''} do modo atual serão apagados
            permanentemente e você vai configurar tudo do zero. Não dá para desfazer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <label htmlFor="confirm-switch" className="text-xs text-zinc-400">
            Digite <strong>APAGAR</strong> para confirmar
          </label>
          <Input
            id="confirm-switch"
            value={switching.confirmation}
            onChange={(event) => switching.setConfirmation(event.target.value)}
            autoComplete="off"
          />
          {switching.error ? <p className="text-xs text-red-400">{switching.error}</p> : null}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={switching.isPending}>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={!switching.confirmed || switching.isPending}
            onClick={switching.submit}
          >
            {switching.isPending ? 'Apagando…' : 'Apagar e mudar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
