import makeWASocket, { Browsers, fetchLatestBaileysVersion, type WASocket } from '@whiskeysockets/baileys';
import pino from 'pino';
import type { WhatsappAuthStore } from '../domain/whatsapp-auth-store';
import { loadAuthState } from './baileys-auth-state';

const logger = pino({ level: 'silent' });

export type OpenedSocket = {
  socket: WASocket;
  registered: boolean;
  flush: () => Promise<void>;
};

export type SocketOpener = (store: WhatsappAuthStore, userId: string) => Promise<OpenedSocket>;

type WaVersion = Awaited<ReturnType<typeof fetchLatestBaileysVersion>>['version'];

let cachedVersion: Promise<WaVersion> | null = null;

function latestVersion(): Promise<WaVersion> {
  cachedVersion ??= fetchLatestBaileysVersion()
    .then(({ version }) => version)
    .catch((error) => {
      cachedVersion = null;
      throw error;
    });
  return cachedVersion;
}

export const openSocket: SocketOpener = async (store, userId) => {
  const [{ state, saveCreds, flush }, version] = await Promise.all([
    loadAuthState(store, userId),
    latestVersion(),
  ]);
  const socket = makeWASocket({
    auth: state,
    version,
    logger,
    browser: Browsers.macOS('Chrome'),
    syncFullHistory: false,
    markOnlineOnConnect: false,
  });
  socket.ev.on('creds.update', () => {
    saveCreds().catch((error) => console.error('Failed to save WhatsApp credentials:', error));
  });
  return { socket, registered: Boolean(state.creds.registered), flush };
};
