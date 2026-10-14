'use server';

import {
  requestPasswordResetToken,
  resetUserPassword,
  changeUserPassword,
} from '@/modules/auth/application/password-reset';
import { requireUserId } from '@/modules/auth/infrastructure/require-user-id';
import { emailService, passwordResetTokenRepository } from '@/composition/auth';
import { userRepository } from '@/composition/users';
import { changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from './auth-schemas';

export async function requestPasswordReset(
  formData: FormData
): Promise<{ error?: string; success?: boolean; message?: string }> {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = forgotPasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: 'Informe um email válido.' };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';

    const result = await requestPasswordResetToken(
      userRepository,
      passwordResetTokenRepository,
      parsed.data.email,
      appUrl,
      emailService
    );

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erro ao solicitar redefinição de senha' };
  }
}

export async function resetPassword(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = resetPasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || 'Dados inválidos.' };
    }

    return await resetUserPassword(
      userRepository,
      passwordResetTokenRepository,
      parsed.data.token,
      parsed.data.password
    );
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erro ao redefinir a senha' };
  }
}

export async function changePassword(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    const userId = await requireUserId();
    const raw = Object.fromEntries(formData.entries());
    const parsed = changePasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || 'Dados inválidos.' };
    }

    return await changeUserPassword(
      userRepository,
      userId,
      parsed.data.currentPassword,
      parsed.data.newPassword
    );
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erro ao alterar a senha' };
  }
}
