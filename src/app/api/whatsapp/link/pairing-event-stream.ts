import QRCode from 'qrcode';
import type { PairingEvent } from '@/modules/notifications/whatsapp/domain/whatsapp-pairing';

const QR_WIDTH = 280;
const FAILURE = { type: 'failed', reason: 'Não foi possível conectar o WhatsApp.' };

async function toPayload(event: PairingEvent): Promise<object> {
  if (event.type !== 'qr') return event;
  return { type: 'qr', image: await QRCode.toDataURL(event.qr, { margin: 1, width: QR_WIDTH }) };
}

export function pairingEventStream(events: AsyncIterable<PairingEvent>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const frame = (payload: object) => encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of events) controller.enqueue(frame(await toPayload(event)));
      } catch (error) {
        console.error('WhatsApp pairing stream failed:', error);
        controller.enqueue(frame(FAILURE));
      } finally {
        controller.close();
      }
    },
  });
}
