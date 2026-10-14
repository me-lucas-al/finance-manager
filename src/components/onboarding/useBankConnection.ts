'use client';

import { useState } from 'react';

const RECORD_FAILURE_MESSAGE = 'Banco conectado no Pluggy, mas houve um erro ao registrá-lo no app.';

export function useBankConnection(onConnected?: () => void) {
  const [connectToken, setConnectToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const closeDialog = () => setConnectToken('');

  const start = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const response = await fetch('/api/connect-token', { method: 'POST' });
      const data = await response.json();
      if (!response.ok || !data.accessToken) throw new Error(data.error ?? 'Sem token');
      setConnectToken(data.accessToken);
    } catch (err) {
      console.error('Failed to get Pluggy connect token', err);
      setErrorMessage('Não foi possível iniciar a conexão. Tente novamente em instantes.');
    } finally {
      setIsLoading(false);
    }
  };

  const recordItem = async (itemId: string) => {
    closeDialog();
    try {
      const response = await fetch('/api/pluggy-item-connected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error ?? RECORD_FAILURE_MESSAGE);
        return;
      }
      setSuccessMessage('Banco conectado! Seus dados já estão sendo importados.');
      onConnected?.();
    } catch (err) {
      console.error('Failed to record item connection', err);
      setErrorMessage(RECORD_FAILURE_MESSAGE);
    }
  };

  const failConnection = (error: unknown) => {
    console.error('Pluggy connection failed', error);
    setErrorMessage('Falha ao conectar a conta. Tente novamente.');
    closeDialog();
  };

  return { connectToken, isLoading, errorMessage, successMessage, start, recordItem, failConnection, closeDialog };
}
