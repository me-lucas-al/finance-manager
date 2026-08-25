import { UserRepository } from '../../users/domain/repositories/user-repository';
import { hashPassword, verifyPassword } from '../domain/password';
import { EmailService } from '../../notifications/email/EmailService';

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
  email: string,
  appUrl: string = 'http://localhost:3000',
  emailService?: EmailService
): Promise<{ success: boolean; token?: string; message: string }> {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    return {
      success: true,
      message: 'Se este email estiver cadastrado, enviamos um link para redefinição da sua senha. Verifique sua caixa de entrada e spam.',
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

  const resetUrl = `${appUrl.replace(/\/$/, '')}/reset-password?token=${token}`;

  if (emailService) {
    await emailService.sendPasswordResetEmail(user.email, resetUrl);
  }

  return {
    success: true,
    token,
    message: 'Se este email estiver cadastrado, enviamos um link para redefinição da sua senha. Verifique sua caixa de entrada e spam.',
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

export async function changeUserPassword(
  userRepo: UserRepository,
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const user = await userRepo.findById(userId);
  if (!user) {
    return { success: false, error: 'Usuário não encontrado' };
  }

  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) {
    return { success: false, error: 'Senha atual incorreta.' };
  }

  const passwordHash = await hashPassword(newPassword);
  await userRepo.update(userId, { passwordHash });

  return { success: true };
}
