import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WhatsappQrArea } from './WhatsappQrArea';
import type { PairingStatus } from './useWhatsappPairing';

type WhatsappConnectDialogProps = {
  open: boolean;
  status: PairingStatus;
  qrImage: string | null;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
};

const STEPS = [
  'Abra o WhatsApp no celular',
  'Toque em Aparelhos conectados',
  'Toque em Conectar um aparelho',
  'Aponte a câmera para este código',
];

export function WhatsappConnectDialog({ open, onClose, ...area }: WhatsappConnectDialogProps) {
  const connected = area.status === 'connected';
  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar WhatsApp</DialogTitle>
          <DialogDescription>
            {connected ? 'Pronto, os avisos chegam por aqui.' : 'Escaneie o código com o celular. Ele se renova sozinho.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-xl bg-white p-2">
            <WhatsappQrArea {...area} />
          </div>
          {connected ? null : (
            <ol className="list-decimal space-y-1 pl-5 text-xs text-zinc-400">
              {STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}
          <Button variant={connected ? 'default' : 'outline'} size="sm" onClick={onClose}>
            {connected ? 'Concluir' : 'Cancelar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
