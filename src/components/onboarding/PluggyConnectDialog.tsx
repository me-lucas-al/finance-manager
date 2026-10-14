'use client';

import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const PluggyConnect = dynamic(() => import('react-pluggy-connect').then((mod) => mod.PluggyConnect), { ssr: false });

type PluggyConnectDialogProps = {
  connectToken: string;
  onItemConnected: (itemId: string) => void;
  onError: (error: unknown) => void;
  onClose: () => void;
};

export function PluggyConnectDialog({ connectToken, onItemConnected, onError, onClose }: PluggyConnectDialogProps) {
  const isOpen = connectToken !== '';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-w-2xl overflow-hidden border-zinc-800 bg-[#111216] p-0 text-white">
        <DialogHeader className="border-b border-zinc-800 p-4">
          <DialogTitle className="text-sm font-semibold">Conectar instituição financeira</DialogTitle>
        </DialogHeader>
        {isOpen ? (
          <div className="h-[600px] w-full bg-white">
            <PluggyConnect
              connectToken={connectToken}
              includeSandbox={process.env.NODE_ENV !== 'production'}
              onSuccess={(itemData) => onItemConnected(itemData.item.id)}
              onError={onError}
              onClose={onClose}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
