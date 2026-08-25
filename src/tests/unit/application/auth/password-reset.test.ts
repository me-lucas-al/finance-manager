import { describe, it, expect, beforeEach } from 'vitest';
import {
  requestPasswordResetToken,
  resetUserPassword,
  PasswordResetTokenRepository,
  PasswordResetTokenRecord,
} from '../../../../modules/auth/application/password-reset';
import { hashPassword, verifyPassword } from '../../../../modules/auth/domain/password';
import { FakeUserRepository } from '../users/fake-user-repository';

class FakePasswordResetTokenRepository implements PasswordResetTokenRepository {
  private tokens: PasswordResetTokenRecord[] = [];

  async create(data: { id: string; userId: string; token: string; expiresAt: Date }): Promise<PasswordResetTokenRecord> {
    const record: PasswordResetTokenRecord = {
      id: data.id,
      userId: data.userId,
      token: data.token,
      expiresAt: data.expiresAt,
      usedAt: null,
      createdAt: new Date(),
    };
    this.tokens.push(record);
    return record;
  }

  async findByToken(token: string): Promise<PasswordResetTokenRecord | null> {
    return this.tokens.find((t) => t.token === token) ?? null;
  }

  async markAsUsed(id: string): Promise<void> {
    const record = this.tokens.find((t) => t.id === id);
    if (record) {
      record.usedAt = new Date();
    }
  }
}

describe('Password Reset Use Cases', () => {
  let userRepo: FakeUserRepository;
  let tokenRepo: FakePasswordResetTokenRepository;

  beforeEach(async () => {
    userRepo = new FakeUserRepository();
    tokenRepo = new FakePasswordResetTokenRepository();

    await userRepo.create({
      name: 'Existing User',
      email: 'user@example.com',
      passwordHash: await hashPassword('old-password-123'),
    });
  });

  describe('requestPasswordResetToken', () => {
    it('creates and returns a reset token for an existing user', async () => {
      const result = await requestPasswordResetToken(userRepo, tokenRepo, 'user@example.com');

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();

      const storedToken = await tokenRepo.findByToken(result.token!);
      expect(storedToken).not.toBeNull();
      expect(storedToken?.userId).toBeDefined();
    });

    it('returns a generic success message without a token for a non-existing user', async () => {
      const result = await requestPasswordResetToken(userRepo, tokenRepo, 'nonexistent@example.com');

      expect(result.success).toBe(true);
      expect(result.token).toBeUndefined();
      expect(result.message).toContain('instruções');
    });
  });

  describe('resetUserPassword', () => {
    it('updates user password and marks token as used when valid', async () => {
      const { token } = await requestPasswordResetToken(userRepo, tokenRepo, 'user@example.com');
      expect(token).toBeDefined();

      const resetResult = await resetUserPassword(userRepo, tokenRepo, token!, 'new-secure-password');
      expect(resetResult.success).toBe(true);

      const user = await userRepo.findByEmail('user@example.com');
      const isNewPasswordValid = await verifyPassword('new-secure-password', user!.passwordHash);
      expect(isNewPasswordValid).toBe(true);

      const isOldPasswordValid = await verifyPassword('old-password-123', user!.passwordHash);
      expect(isOldPasswordValid).toBe(false);

      const usedToken = await tokenRepo.findByToken(token!);
      expect(usedToken?.usedAt).not.toBeNull();
    });

    it('rejects an invalid token', async () => {
      const result = await resetUserPassword(userRepo, tokenRepo, 'invalid-token-xyz', 'new-password-123');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Link de redefinição inválido ou expirado.');
    });

    it('rejects an already used token', async () => {
      const { token } = await requestPasswordResetToken(userRepo, tokenRepo, 'user@example.com');
      await resetUserPassword(userRepo, tokenRepo, token!, 'password-attempt-1');

      const secondAttempt = await resetUserPassword(userRepo, tokenRepo, token!, 'password-attempt-2');
      expect(secondAttempt.success).toBe(false);
      expect(secondAttempt.error).toBe('Link de redefinição inválido ou expirado.');
    });

    it('rejects an expired token', async () => {
      const user = await userRepo.findByEmail('user@example.com');
      await tokenRepo.create({
        id: 'expired-tok-id',
        userId: user!.id,
        token: 'expired-token-123',
        expiresAt: new Date(Date.now() - 3600 * 1000), // 1 hour in the past
      });

      const result = await resetUserPassword(userRepo, tokenRepo, 'expired-token-123', 'new-password-123');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Link de redefinição inválido ou expirado.');
    });
  });
});
