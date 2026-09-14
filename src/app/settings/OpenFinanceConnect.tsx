'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Landmark, CheckCircle, AlertCircle } from 'lucide-react';

export function OpenFinanceConnect() {
  const [itemId, setItemId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const registerPluggyItemConnection = async () => {
    const trimmedItemId = itemId.trim();
    if (!trimmedItemId) return;

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/pluggy-item-connected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: trimmedItemId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Falha ao registrar a conexão.');
      setSuccessMsg('Conta conectada com sucesso! As transações devem começar a aparecer em breve.');
      setItemId('');
    } catch (err) {
      console.error('Failed to record item connection', err);
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao registrar a conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <p className="text-sm text-muted-foreground">
        Conecte seu banco em{' '}
        <a href="https://meupluggy.ai" target="_blank" rel="noreferrer" className="underline">
          meupluggy.ai
        </a>{' '}
        e vincule a conexão à sua aplicação no{' '}
        <a href="https://dashboard.pluggy.ai" target="_blank" rel="noreferrer" className="underline">
          Pluggy Dashboard
        </a>
        . Depois cole abaixo o Item ID gerado para começar a importar as transações automaticamente.
      </p>

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

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={itemId}
          onChange={(event) => setItemId(event.target.value)}
          placeholder="Item ID do Pluggy"
          disabled={isSubmitting}
        />
        <Button
          onClick={registerPluggyItemConnection}
          disabled={isSubmitting || !itemId.trim()}
          variant="outline"
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Landmark className="mr-2 h-4 w-4" />}
          {isSubmitting ? 'Registrando...' : 'Registrar Conexão'}
        </Button>
      </div>
    </div>
  );
}
