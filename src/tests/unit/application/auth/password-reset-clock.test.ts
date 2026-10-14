import { describe, it, expect } from 'vitest';
import {
  requestPasswordResetToken,
  resetUserPassword,
  type PasswordResetTokenRecord,
  type PasswordResetTokenRepository,
} from '@/modules/auth/application/password-reset';
import type { Clock } from '@/shared/clock';
import { FakeUserRepository } from '../users/fake-user-repository';

class InMemoryTokenRepository implements PasswordResetTokenRepository {
  records: PasswordResetTokenRecord[] = [];

  async create(data: { id: string; userId: string; token: string; expiresAt: Date }) {
    const record = { ...data, usedAt: null, createdAt: new Date() };
    this.records.push(record);
    return record;
  }

  async findByToken(token: string) {
    return this.records.find((record) => record.token === token) ?? null;
  }

  async markAsUsed(id: string) {
    const record = this.records.find((candidate) => candidate.id === id);
    if (record) record.usedAt = new Date();
  }
}

function clockAt(iso: string): Clock {
  return { now: () => new Date(iso) };
}

describe('password reset with injected clock', () => {
  it('expires the token one hour after the injected time', async () => {
    const users = new FakeUserRepository();
    await users.create({ name: 'A', email: 'a@x.com', passwordHash: 'hash' });
    const tokens = new InMemoryTokenRepository();

    await requestPasswordResetToken(users, tokens, 'a@x.com', undefined, undefined, clockAt('2026-01-01T10:00:00Z'));

    expect(tokens.records[0].expiresAt.toISOString()).toBe('2026-01-01T11:00:00.000Z');
  });

  it('rejects a token when the injected time is past its expiry', async () => {
    const users = new FakeUserRepository();
    await users.create({ name: 'A', email: 'a@x.com', passwordHash: 'hash' });
    const tokens = new InMemoryTokenRepository();
    const { token } = await requestPasswordResetToken(
      users, tokens, 'a@x.com', undefined, undefined, clockAt('2026-01-01T10:00:00Z')
    );

    const result = await resetUserPassword(users, tokens, token!, 'new-password', clockAt('2026-01-01T12:00:00Z'));

    expect(result.success).toBe(false);
  });
});
