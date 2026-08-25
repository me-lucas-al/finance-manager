import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  requestPasswordResetToken,
  resetUserPassword,
  changeUserPassword,
  PasswordResetTokenRepository,
  PasswordResetTokenRecord,
} from '../../../../modules/auth/application/password-reset';
import { hashPassword, verifyPassword } from '../../../../modules/auth/domain/password';
import { FakeUserRepository } from '../users/fake-user-repository';
import { EmailService } from '../../../../modules/notifications/email/EmailService';

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

describe('Password Reset and Change Use Cases', () => {
  let userRepo: FakeUserRepository;
  let tokenRepo: FakePasswordResetTokenRepository;
  let emailServiceMock: EmailService;

  beforeEach(async () => {
    userRepo = new FakeUserRepository();
    tokenRepo = new FakePasswordResetTokenRepository();
    emailServiceMock = {
      sendEmail: vi.fn().mockResolvedValue({ success: true }),
      sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
    };

    await userRepo.create({
      name: 'Existing User',
      email: 'user@example.com',
      passwordHash: await hashPassword('old-password-123'),
    });
  });

  describe('requestPasswordResetToken', () => {
    it('creates token and dispatches reset email to the user', async () => {
      const result = await requestPasswordResetToken(
        userRepo,
        tokenRepo,
        'user@example.com',
        'http://localhost:3000',
        emailServiceMock
      );

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(emailServiceMock.sendPasswordResetEmail).toHaveBeenCalledWith(
        'user@example.com',
        expect.stringContaining(`http://localhost:3000/reset-password?token=${result.token}`)
      );

      const storedToken = await tokenRepo.findByToken(result.token!);
      expect(storedToken).not.toBeNull();
      expect(storedToken?.userId).toBeDefined();
    });

    it('returns a generic success message without sending email for a non-existing user', async () => {
      const result = await requestPasswordResetToken(
        userRepo,
        tokenRepo,
        'nonexistent@example.com',
        'http://localhost:3000',
        emailServiceMock
      );

      expect(result.success).toBe(true);
      expect(result.token).toBeUndefined();
      expect(emailServiceMock.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(result.message).toContain('redefinição');
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
        expiresAt: new Date(Date.now() - 3600 * 1000),
      });

      const result = await resetUserPassword(userRepo, tokenRepo, 'expired-token-123', 'new-password-123');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Link de redefinição inválido ou expirado.');
    });
  });

  describe('changeUserPassword (logged-in user)', () => {
    it('successfully changes password when current password is correct', async () => {
      const user = await userRepo.findByEmail('user@example.com');
      const result = await changeUserPassword(userRepo, user!.id, 'old-password-123', 'new-password-456');

      expect(result.success).toBe(true);

      const updatedUser = await userRepo.findById(user!.id);
      const isNewValid = await verifyPassword('new-password-456', updatedUser!.passwordHash);
      expect(isNewValid).toBe(true);
    });

    it('rejects password change when current password is wrong', async () => {
      const user = await userRepo.findByEmail('user@example.com');
      const result = await changeUserPassword(userRepo, user!.id, 'wrong-password', 'new-password-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Senha atual incorreta.');
    });
  });
});

