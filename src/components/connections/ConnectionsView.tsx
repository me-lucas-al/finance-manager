'use client';

import { useState } from 'react';
import { Cable, LayoutGrid } from 'lucide-react';
import { BankConnectionCard } from './BankConnectionCard';
import { bankLabel, itemStatusPresentation } from './bank-style';
import type { BankConnection } from './group-accounts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function formatLastSynced(lastSyncedAt: string | null): string {
  if (!lastSyncedAt) return 'Nunca sincronizado';
  return new Date(lastSyncedAt).toLocaleString('pt-BR');
}

export function ConnectionsView({ connections }: { connections: BankConnection[] }) {
  const [selectedConn, setSelectedConn] = useState<BankConnection | null>(null);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-blue-500">
            <Cable className="h-4 w-4" />
          </div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            CONEXÕES
          </h2>
          <span className="inline-flex items-center rounded-full bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
            {connections.length} {connections.length === 1 ? 'ativa' : 'ativas'}
          </span>
        </div>

        {connections.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800/80 bg-[#111216] p-12 text-center">
            <p className="text-sm text-zinc-400">Nenhuma instituição conectada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {connections.map((conn) => (
              <button
                key={conn.pluggyItemId}
                type="button"
                onClick={() => setSelectedConn(conn)}
                className="text-left"
              >
                <BankConnectionCard connection={conn} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 text-zinc-400">
          <LayoutGrid className="h-4 w-4 text-blue-500" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            APPS PARCEIROS
          </h2>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-[#111216] p-12 text-center">
          <p className="text-sm text-zinc-400">
            Nenhum app parceiro está acessando seus dados.
          </p>
        </div>
      </div>

      <Dialog open={!!selectedConn} onOpenChange={(open) => !open && setSelectedConn(null)}>
        <DialogContent className="bg-[#121318] border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <span>Detalhes da Conexão · {selectedConn ? bankLabel(selectedConn.bank) : ''}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedConn && (
            <div className="space-y-3 pt-3 text-xs text-zinc-300">
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-500">Status</span>
                <span>{itemStatusPresentation(selectedConn.itemStatus).label}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-500">Última sincronização</span>
                <span>{formatLastSynced(selectedConn.lastSyncedAt)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-500">Contas vinculadas</span>
                <span>{selectedConn.accountCount} conta{selectedConn.accountCount === 1 ? '' : 's'}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
