'use client';

import { AlertCircle, CheckCircle, Landmark, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PluggyConnectDialog } from './PluggyConnectDialog';
import { useBankConnection } from './useBankConnection';

type ConnectBankButtonProps = {
  onConnected?: () => void;
  label?: string;
};

const ERROR_STYLE = 'border-red-900/50 bg-red-950/40 text-red-400';
const SUCCESS_STYLE = 'border-emerald-900/50 bg-emerald-950/40 text-emerald-400';

export function ConnectBankButton({ onConnected, label = 'Conectar meu banco' }: ConnectBankButtonProps) {
  const connection = useBankConnection(onConnected);

  return (
    <div className="flex flex-col items-center gap-3">
      <Button type="button" onClick={connection.start} disabled={connection.isLoading} className="gap-2">
        {connection.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Landmark className="h-4 w-4" />}
        {connection.isLoading ? 'Abrindo…' : label}
      </Button>

      {connection.errorMessage ? (
        <div className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs ${ERROR_STYLE}`}>
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{connection.errorMessage}</span>
        </div>
      ) : null}
      {connection.successMessage ? (
        <div className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs ${SUCCESS_STYLE}`}>
          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{connection.successMessage}</span>
        </div>
      ) : null}

      <PluggyConnectDialog
        connectToken={connection.connectToken}
        onItemConnected={connection.recordItem}
        onError={connection.failConnection}
        onClose={connection.closeDialog}
      />
    </div>
  );
}
