export type PairingEvent =
  | { type: 'qr'; qr: string }
  | { type: 'connected'; jid: string }
  | { type: 'failed'; reason: string };

export interface WhatsappPairing {
  pair(userId: string, signal: AbortSignal): AsyncIterable<PairingEvent>;
}
