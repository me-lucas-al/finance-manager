'use client';

import { PluggyConnect } from 'react-pluggy-connect';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Landmark, CheckCircle, AlertCircle } from 'lucide-react';

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
    <div className="flex flex-col space-y-4">
      {errorMsg && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
          <CheckCircle className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      <div>
        <Button 
          onClick={handleConnect} 
          disabled={isLoading || isOpen}
          variant="outline"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Landmark className="mr-2 h-4 w-4" />}
          {isLoading ? 'Conectando...' : 'Conectar Novo Banco'}
        </Button>
      </div>

      {isOpen && connectToken && (
        <div className="mt-4 border rounded overflow-hidden" style={{ height: '600px' }}>
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
                setSuccessMsg('Conta conectada com sucesso! As transações devem começar a aparecer em breve.');
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
    </div>
  );
}
