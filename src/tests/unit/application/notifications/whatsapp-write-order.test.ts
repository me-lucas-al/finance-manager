import { describe, it, expect } from 'vitest';
import { KeyedMutex } from '@/shared/infrastructure/keyed-mutex';
import { loadAuthState } from '@/modules/notifications/whatsapp/infrastructure/baileys-auth-state';
import { FakeWhatsappAuthStore } from '@/tests/fakes/fake-whatsapp';
import { tick } from '@/tests/fakes/fake-baileys-socket';

describe('auth state write order', () => {
  it('saves writes one at a time in the order they were requested and flushes them', async () => {
    const order: string[] = [];
    const inner = new FakeWhatsappAuthStore();
    const slow = {
      ...inner,
      readMany: inner.readMany.bind(inner),
      clear: inner.clear.bind(inner),
      write: async (userId: string, entries: Record<string, string | null>) => {
        const name = Object.keys(entries)[0];
        order.push(`start:${name}`);
        await tick();
        order.push(`end:${name}`);
        await inner.write(userId, entries);
      },
    };
    const { state, saveCreds, flush } = await loadAuthState(slow, 'u1');

    void saveCreds();
    void state.keys.set({ session: { a: new Uint8Array([1]) } });
    await flush();

    expect(order).toEqual(['start:creds', 'end:creds', 'start:session-a', 'end:session-a']);
  });

  it('keeps accepting writes after one of them failed', async () => {
    const inner = new FakeWhatsappAuthStore();
    let failNext = true;
    const flaky = {
      ...inner,
      readMany: inner.readMany.bind(inner),
      clear: inner.clear.bind(inner),
      write: async (userId: string, entries: Record<string, string | null>) => {
        if (failNext) {
          failNext = false;
          throw new Error('db down');
        }
        await inner.write(userId, entries);
      },
    };
    const { saveCreds, flush } = await loadAuthState(flaky, 'u1');

    await expect(saveCreds()).rejects.toThrow('db down');
    await saveCreds();
    await flush();

    expect((await inner.readMany('u1', ['creds'])).creds).toBeDefined();
  });
});

describe('KeyedMutex', () => {
  it('serializes the same key and lets different keys run together', async () => {
    const mutex = new KeyedMutex();
    const order: string[] = [];
    const task = (label: string, key: string) =>
      mutex.run(key, async () => {
        order.push(`start:${label}`);
        await tick();
        order.push(`end:${label}`);
      });

    await Promise.all([task('a1', 'a'), task('a2', 'a'), task('b1', 'b')]);

    expect(order.indexOf('end:a1')).toBeLessThan(order.indexOf('start:a2'));
    expect(order.indexOf('start:b1')).toBeLessThan(order.indexOf('end:a1'));
  });

  it('releases the key after an error', async () => {
    const mutex = new KeyedMutex();

    await expect(mutex.run('a', async () => Promise.reject(new Error('boom')))).rejects.toThrow('boom');

    await expect(mutex.run('a', async () => 'ok')).resolves.toBe('ok');
  });
});
