import type { AuthEntries, WhatsappAuthStore } from '../domain/whatsapp-auth-store';
import type { SessionCipher } from './session-cipher';

const contextOf = (userId: string, name: string): string => `${userId}:${name}`;

export class EncryptedWhatsappAuthStore implements WhatsappAuthStore {
  constructor(
    private readonly inner: WhatsappAuthStore,
    private readonly cipher: SessionCipher,
  ) {}

  async readMany(userId: string, names: string[]): Promise<Record<string, string>> {
    const stored = await this.inner.readMany(userId, names);
    return Object.fromEntries(
      Object.entries(stored).map(([name, value]) => [name, this.cipher.decrypt(value, contextOf(userId, name))]),
    );
  }

  async write(userId: string, entries: AuthEntries): Promise<void> {
    const encrypted = Object.fromEntries(
      Object.entries(entries).map(([name, value]) => [
        name,
        value === null ? null : this.cipher.encrypt(value, contextOf(userId, name)),
      ]),
    );
    await this.inner.write(userId, encrypted);
  }

  clear(userId: string): Promise<void> {
    return this.inner.clear(userId);
  }
}
