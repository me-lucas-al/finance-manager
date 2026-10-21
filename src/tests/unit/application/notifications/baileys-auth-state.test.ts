import { describe, it, expect } from 'vitest';
import { loadAuthState } from '@/modules/notifications/whatsapp/infrastructure/baileys-auth-state';
import { FakeWhatsappAuthStore } from '@/tests/fakes/fake-whatsapp';

describe('baileys auth state on top of the auth store', () => {
  it('creates fresh credentials for a new user and persists them', async () => {
    const store = new FakeWhatsappAuthStore();

    const first = await loadAuthState(store, 'u1');
    await first.saveCreds();
    const second = await loadAuthState(store, 'u1');

    expect(second.state.creds.registrationId).toBe(first.state.creds.registrationId);
    expect(Buffer.from(second.state.creds.noiseKey.public).equals(Buffer.from(first.state.creds.noiseKey.public))).toBe(true);
  });

  it('round trips binary keys and deletes the ones set to null', async () => {
    const store = new FakeWhatsappAuthStore();
    const { state } = await loadAuthState(store, 'u1');
    const session = new Uint8Array([1, 2, 3]);

    await state.keys.set({ session: { 'a/b:1': session } });
    const stored = await state.keys.get('session', ['a/b:1', 'missing']);

    expect(Array.from(stored['a/b:1'])).toEqual([1, 2, 3]);
    expect(stored.missing).toBeUndefined();

    await state.keys.set({ session: { 'a/b:1': null } });
    expect(await state.keys.get('session', ['a/b:1'])).toEqual({});
  });

  it('keeps each user session separate', async () => {
    const store = new FakeWhatsappAuthStore();
    const one = await loadAuthState(store, 'u1');
    const two = await loadAuthState(store, 'u2');

    await one.state.keys.set({ session: { id: new Uint8Array([9]) } });

    expect(await two.state.keys.get('session', ['id'])).toEqual({});
  });
});
