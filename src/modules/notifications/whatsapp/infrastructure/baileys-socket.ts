import makeWASocket, { Browsers, fetchLatestBaileysVersion, type WASocket } from '@whiskeysockets/baileys';
import pino from 'pino';
import type { WhatsappAuthStore } from '../domain/whatsapp-auth-store';
import { loadAuthState } from './baileys-auth-state';

const logger = pino({ level: 'silent' });

export async function openSocket(store: WhatsappAuthStore, userId: string): Promise<WASocket> {
  const [{ state, saveCreds }, { version }] = await Promise.all([
    loadAuthState(store, userId),
    fetchLatestBaileysVersion(),
  ]);
  const socket = makeWASocket({
    auth: state,
    version,
    logger,
    browser: Browsers.macOS('Chrome'),
    syncFullHistory: false,
    markOnlineOnConnect: false,
  });
  socket.ev.on('creds.update', saveCreds);
  return socket;
}
