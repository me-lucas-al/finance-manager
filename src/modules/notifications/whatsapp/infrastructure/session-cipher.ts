import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const VERSION = 'v1';
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;

export interface SessionCipher {
  encrypt(text: string, context: string): string;
  decrypt(payload: string, context: string): string;
}

export function keyFromEnvironment(): Buffer {
  const key = Buffer.from(process.env.WHATSAPP_SESSION_KEY ?? '', 'base64');
  if (key.length !== KEY_BYTES) {
    throw new Error('WHATSAPP_SESSION_KEY must be a base64 encoded 32 byte key');
  }
  return key;
}

export class AesGcmSessionCipher implements SessionCipher {
  constructor(private readonly readKey: () => Buffer = keyFromEnvironment) {}

  encrypt(text: string, context: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.readKey(), iv);
    cipher.setAAD(Buffer.from(context));
    const body = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return `${VERSION}:${Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64')}`;
  }

  decrypt(payload: string, context: string): string {
    const [version, encoded] = payload.split(':');
    if (version !== VERSION || !encoded) throw new Error('Unsupported WhatsApp session payload');
    const bytes = Buffer.from(encoded, 'base64');
    const decipher = createDecipheriv(ALGORITHM, this.readKey(), bytes.subarray(0, IV_BYTES));
    decipher.setAAD(Buffer.from(context));
    decipher.setAuthTag(bytes.subarray(IV_BYTES, IV_BYTES + TAG_BYTES));
    const body = bytes.subarray(IV_BYTES + TAG_BYTES);
    return Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8');
  }
}
