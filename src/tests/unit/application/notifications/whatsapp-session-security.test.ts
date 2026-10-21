import { describe, it, expect, vi } from 'vitest';
import { EncryptedWhatsappAuthStore } from '@/modules/notifications/whatsapp/infrastructure/encrypted-whatsapp-auth-store';
import { AesGcmSessionCipher, keyFromEnvironment } from '@/modules/notifications/whatsapp/infrastructure/session-cipher';
import { FakeWhatsappAuthStore } from '@/tests/fakes/fake-whatsapp';

const key = Buffer.alloc(32, 7);
const cipher = new AesGcmSessionCipher(() => key);

describe('session cipher', () => {
  it('round trips a value and never repeats the ciphertext', () => {
    const one = cipher.encrypt('segredo', 'u1:creds');
    const two = cipher.encrypt('segredo', 'u1:creds');

    expect(cipher.decrypt(one, 'u1:creds')).toBe('segredo');
    expect(one).not.toContain('segredo');
    expect(one).not.toBe(two);
  });

  it('refuses a value moved to another user or key name', () => {
    const payload = cipher.encrypt('segredo', 'u1:creds');

    expect(() => cipher.decrypt(payload, 'u2:creds')).toThrow();
    expect(() => cipher.decrypt(payload, 'u1:session-x')).toThrow();
  });

  it('refuses a tampered value', () => {
    const payload = cipher.encrypt('segredo', 'u1:creds');
    const tampered = `${payload.slice(0, -2)}AA`;

    expect(() => cipher.decrypt(tampered, 'u1:creds')).toThrow();
  });

  it('requires a 32 byte key in the environment', () => {
    vi.stubEnv('WHATSAPP_SESSION_KEY', '');
    expect(() => keyFromEnvironment()).toThrow('WHATSAPP_SESSION_KEY');

    vi.stubEnv('WHATSAPP_SESSION_KEY', key.toString('base64'));
    expect(keyFromEnvironment().equals(key)).toBe(true);
    vi.unstubAllEnvs();
  });
});

describe('encrypted auth store', () => {
  it('keeps only ciphertext in the inner store and reads plaintext back', async () => {
    const inner = new FakeWhatsappAuthStore();
    const store = new EncryptedWhatsappAuthStore(inner, cipher);

    await store.write('u1', { creds: '{"a":1}', other: null });

    expect([...inner.entries.values()].some((value) => value.includes('"a":1'))).toBe(false);
    expect(await store.readMany('u1', ['creds'])).toEqual({ creds: '{"a":1}' });
  });

  it('clears everything of a user', async () => {
    const inner = new FakeWhatsappAuthStore();
    const store = new EncryptedWhatsappAuthStore(inner, cipher);
    await store.write('u1', { creds: 'x' });

    await store.clear('u1');

    expect(inner.entries.size).toBe(0);
  });
});
