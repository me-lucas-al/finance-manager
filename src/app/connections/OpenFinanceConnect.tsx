'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const PluggyConnect = dynamic(
  () => import('react-pluggy-connect').then((mod) => mod.PluggyConnect),
  { ssr: false }
);
import { Button } from '@/components/ui/button';
import { Loader2, Plus, CheckCircle, AlertCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function OpenFinanceConnect() {
  const [connectToken, setConnectToken] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleConnect = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/connect-token', { method: 'POST' });
      const data = await res.json();
      if (data.accessToken) {
        setConnectToken(data.accessToken);
        setIsOpen(true);
      } else {
        console.error('Failed to get token', data);
        setErrorMsg('Erro ao gerar token de conexão.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro de conexão ao tentar gerar token.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-end gap-2">
        {errorMsg && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-900/50 p-2.5 rounded-lg">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 p-2.5 rounded-lg">
            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* "+ Nova conexão" button - DARK BLUE per requirement (replaced from red) */}
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-all"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          <span>{isLoading ? 'Conectando...' : 'Nova conexão'}</span>
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl bg-[#111216] border-zinc-800 text-white p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-zinc-800 flex flex-row items-center justify-between">
            <DialogTitle className="text-sm font-semibold">Conectar nova instituição</DialogTitle>
          </DialogHeader>

          {isOpen && connectToken && (
            <div className="h-[600px] w-full bg-white">
              <PluggyConnect
                connectToken={connectToken}
                includeSandbox={process.env.NODE_ENV !== 'production'}
                onSuccess={async (itemData) => {
                  setIsOpen(false);
                  setConnectToken('');
                  try {
                    const res = await fetch('/api/pluggy-item-connected', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ itemId: itemData.item.id }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error ?? 'Falha ao registrar a conexão.');
                    setSuccessMsg('Conta conectada com sucesso!');
                  } catch (err) {
                    console.error('Failed to record item connection', err);
                    setErrorMsg('Conta conectada no Pluggy, mas houve um erro ao registrá-la no app.');
                  }
                }}
                onError={(error) => {
                  console.error('Connection failed', error);
                  setErrorMsg('Falha ao conectar a conta no Pluggy.');
                  setIsOpen(false);
                  setConnectToken('');
                }}
                onClose={() => {
                  setIsOpen(false);
                  setConnectToken('');
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
