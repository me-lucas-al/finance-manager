import { UserRepository } from '../../users/domain/repositories/user-repository';
import { hashPassword } from '../domain/password';

export interface PasswordResetTokenRecord {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface PasswordResetTokenRepository {
  create(data: { id: string; userId: string; token: string; expiresAt: Date }): Promise<PasswordResetTokenRecord>;
  findByToken(token: string): Promise<PasswordResetTokenRecord | null>;
  markAsUsed(id: string): Promise<void>;
}

export async function requestPasswordResetToken(
  userRepo: UserRepository,
  tokenRepo: PasswordResetTokenRepository,
  email: string
): Promise<{ success: boolean; token?: string; message: string }> {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    return {
      success: true,
      message: 'Se este email estiver cadastrado, as instruções para redefinição foram geradas.',
    };
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 3600 * 1000);

  await tokenRepo.create({
    id: crypto.randomUUID(),
    userId: user.id,
    token,
    expiresAt,
  });

  return {
    success: true,
    token,
    message: 'Se este email estiver cadastrado, as instruções para redefinição foram geradas.',
  };
}

export async function resetUserPassword(
  userRepo: UserRepository,
  tokenRepo: PasswordResetTokenRepository,
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const tokenRecord = await tokenRepo.findByToken(token);
  if (!tokenRecord || tokenRecord.usedAt || new Date(tokenRecord.expiresAt) < new Date()) {
    return { success: false, error: 'Link de redefinição inválido ou expirado.' };
  }

  const passwordHash = await hashPassword(newPassword);
  await userRepo.update(tokenRecord.userId, { passwordHash });
  await tokenRepo.markAsUsed(tokenRecord.id);

  return { success: true };
}
