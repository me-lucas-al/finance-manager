import { describe, it, expect, beforeEach } from 'vitest';
import { changeUserPassword } from '../../../../modules/auth/application/password-reset';
import { hashPassword, verifyPassword } from '../../../../modules/auth/domain/password';
import { FakeUserRepository } from '@/tests/fakes/fake-user-repository';

describe('changeUserPassword (logged-in user)', () => {
  let userRepo: FakeUserRepository;

  beforeEach(async () => {
    userRepo = new FakeUserRepository();
    await userRepo.create({
      name: 'Existing User',
      email: 'user@example.com',
      passwordHash: await hashPassword('old-password-123'),
    });
  });

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
