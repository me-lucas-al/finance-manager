import { describe, it, expect, beforeEach } from 'vitest';
import { authorizeCredentials } from '../../../../modules/auth/application/authorize-credentials';
import { hashPassword } from '../../../../modules/auth/domain/password';
import { FakeUserRepository } from '../users/fake-user-repository';

describe('authorizeCredentials', () => {
  let userRepo: FakeUserRepository;

  beforeEach(async () => {
    userRepo = new FakeUserRepository();
    await userRepo.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: await hashPassword('correct-password'),
    });
  });

  it('should return the user for correct credentials', async () => {
    const result = await authorizeCredentials(userRepo, 'test@example.com', 'correct-password');

    expect(result).not.toBeNull();
    expect(result?.email).toBe('test@example.com');
    expect(result?.name).toBe('Test User');
  });

  it('should return null for an unknown email', async () => {
    const result = await authorizeCredentials(userRepo, 'unknown@example.com', 'correct-password');
    expect(result).toBeNull();
  });

  it('should return null for an incorrect password', async () => {
    const result = await authorizeCredentials(userRepo, 'test@example.com', 'wrong-password');
    expect(result).toBeNull();
  });

  it('should never expose the password hash', async () => {
    const result = await authorizeCredentials(userRepo, 'test@example.com', 'correct-password');
    expect(result).not.toHaveProperty('passwordHash');
  });
});
