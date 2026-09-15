'use client';

import React, { useState } from 'react';
import { Cable, Clock, LayoutGrid, ChevronRight, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConnectionItem {
  id: string;
  bank: 'inter' | 'nubank' | 'itau';
  name: string;
  status: 'active' | 'error' | 'syncing';
  lastSync: string;
  accountsCount: number;
}

const defaultConnections: ConnectionItem[] = [
  {
    id: 'conn-inter',
    bank: 'inter',
    name: 'Inter',
    status: 'active',
    lastSync: 'Hoje',
    accountsCount: 1,
  },
  {
    id: 'conn-nu',
    bank: 'nubank',
    name: 'Nubank',
    status: 'active',
    lastSync: 'Hoje',
    accountsCount: 1,
  },
  {
    id: 'conn-itau',
    bank: 'itau',
    name: 'Itaú',
    status: 'active',
    lastSync: 'Hoje',
    accountsCount: 1,
  },
];

export function ConnectionsView() {
  const [selectedConn, setSelectedConn] = useState<ConnectionItem | null>(null);

  return (
    <div className="space-y-8">
      {/* 1. CONEXÕES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-blue-500">
            <Cable className="h-4 w-4" />
          </div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            CONEXÕES
          </h2>
          <span className="inline-flex items-center rounded-full bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
            3 ativas
          </span>
        </div>

        {/* 3 Bank Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {defaultConnections.map((conn) => (
            <Card
              key={conn.id}
              className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm hover:border-zinc-700/60 transition-all flex flex-col justify-between"
            >
              <CardContent className="p-6 pb-4">
                {/* Top Row: Logo & Status indicator */}
                <div className="flex items-center justify-between">
                  {/* Bank Badge */}
                  {conn.bank === 'inter' && (
                    <div className="h-10 w-10 rounded-xl bg-[#ff7a00] flex items-center justify-center font-bold text-xs text-white shadow-md">
                      inter
                    </div>
                  )}
                  {conn.bank === 'nubank' && (
                    <div className="h-10 w-10 rounded-xl bg-[#820ad1] flex items-center justify-center font-bold text-sm text-white shadow-md">
                      nu
                    </div>
                  )}
                  {conn.bank === 'itau' && (
                    <div className="h-10 w-10 rounded-xl bg-[#002f6c] flex items-center justify-center font-bold text-xs text-white shadow-md">
                      itaú
                    </div>
                  )}

                  {/* Pulsing Green Dot */}
                  <div className="relative flex items-center justify-center">
                    <span className="absolute h-3 w-3 rounded-full bg-emerald-400/40 animate-ping" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                </div>

                {/* Bank Name */}
                <div className="mt-5">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {conn.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{conn.lastSync}</span>
                  </div>
                </div>
              </CardContent>

              {/* Bottom Action: Ver detalhes > */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedConn(conn)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedConn(conn);
                  }
                }}
                className="border-t border-zinc-800/60 px-6 py-3.5 flex items-center justify-between text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer group rounded-b-2xl outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              >
                <span className="font-medium group-hover:text-white">Ver detalhes</span>
                <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 2. APPS PARCEIROS SECTION */}
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

      {/* Details Dialog */}
      <Dialog open={!!selectedConn} onOpenChange={(open) => !open && setSelectedConn(null)}>
        <DialogContent className="bg-[#121318] border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <span>Detalhes da Conexão · {selectedConn?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-3 text-xs text-zinc-300">
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-500">Status</span>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <Check className="h-3.5 w-3.5" /> Conectado e ativo
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-500">Última sincronização</span>
              <span>Hoje via Open Finance</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-500">Contas vinculadas</span>
              <span>{selectedConn?.accountsCount} conta</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-zinc-500">Permissão</span>
              <span>Leitura de saldos e transações</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
