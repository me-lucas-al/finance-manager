import Image from 'next/image';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PairingStatus } from './useWhatsappPairing';

type WhatsappQrAreaProps = {
  status: PairingStatus;
  qrImage: string | null;
  error: string | null;
  onRetry: () => void;
};

const QR_SIZE = 240;
const AREA = 'flex h-60 w-60 flex-col items-center justify-center gap-2';

export function WhatsappQrArea({ status, qrImage, error, onRetry }: WhatsappQrAreaProps) {
  if (status === 'connected') {
    return (
      <div className={`${AREA} text-emerald-600`}>
        <CheckCircle2 className="h-12 w-12" />
        <p className="text-sm font-medium">WhatsApp conectado!</p>
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className={`${AREA} text-center`}>
        <p className="text-xs text-red-600">{error}</p>
        <Button size="sm" onClick={onRetry}>
          Gerar novo código
        </Button>
      </div>
    );
  }
  if (!qrImage) {
    return (
      <div className={`${AREA} text-xs text-zinc-500`}>
        <Loader2 className="h-6 w-6 animate-spin" />
        Gerando QR code...
      </div>
    );
  }
  return <Image src={qrImage} alt="QR code para conectar o WhatsApp" width={QR_SIZE} height={QR_SIZE} unoptimized />;
}
