import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type WhatsappQrPanelProps = {
  qrImage: string | null;
  onCancel: () => void;
};

const QR_SIZE = 220;

export function WhatsappQrPanel({ qrImage, onCancel }: WhatsappQrPanelProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-56 w-56 items-center justify-center rounded-xl bg-white p-2">
        {qrImage ? (
          <Image src={qrImage} alt="QR code para conectar o WhatsApp" width={QR_SIZE} height={QR_SIZE} unoptimized />
        ) : (
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        )}
      </div>
      <p className="max-w-xs text-center text-xs text-zinc-400">
        No celular, abra o WhatsApp, vá em Aparelhos conectados, toque em Conectar um aparelho e escaneie o código.
      </p>
      <Button type="button" variant="outline" size="sm" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  );
}
