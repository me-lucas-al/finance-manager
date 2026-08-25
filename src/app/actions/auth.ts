'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { AuthError } from 'next-auth';
import { db } from '@/db';
import { notificationPreferences, passwordResetTokens, userSettings } from '@/db/schema';
import { hashPassword } from '@/modules/auth/domain/password';
import { DrizzleUserRepository } from '@/modules/users/infrastructure/repositories';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from '@/auth';

const DEFAULT_EXPENSE_CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Educação'];
const DEFAULT_INVESTMENT_TYPES = ['Reserva de Emergência', 'Renda Fixa', 'FIIs', 'Ações'];

const signUpSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'A senha precisa ter no mínimo 6 caracteres'),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    {
      message: 'As senhas não coincidem',
      path: ['confirmPassword'],
    }
  );

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof (error as { digest: unknown }).digest === 'string' &&
    (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  );
}

export async function signUp(formData: FormData): Promise<{ error?: string }> {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = signUpSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || 'Preencha os campos corretamente.' };
    }

    if (raw.confirmPassword && parsed.data.password !== raw.confirmPassword) {
      return { error: 'As senhas não coincidem' };
    }

    const userRepo = new DrizzleUserRepository();

    const existing = await userRepo.findByEmail(parsed.data.email);
    if (existing) {
      return { error: 'Email já cadastrado' };
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await userRepo.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    });

    await db.insert(userSettings).values({
      id: crypto.randomUUID(),
      userId: user.id,
      expenseCategories: DEFAULT_EXPENSE_CATEGORIES,
      investmentTypes: DEFAULT_INVESTMENT_TYPES,
    });

    await db.insert(notificationPreferences).values({
      id: crypto.randomUUID(),
      userId: user.id,
    });

    try {
      await nextAuthSignIn('credentials', {
        email: parsed.data.email,
        password: parsed.data.password,
        redirectTo: '/',
      });
    } catch (error) {
      if (isNextRedirect(error)) throw error;
      if (error instanceof AuthError) {
        return { error: 'Conta criada, mas houve um erro ao entrar automaticamente. Faça login.' };
      }
      throw error;
    }

    return {};
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return { error: error instanceof Error ? error.message : 'Erro ao criar conta' };
  }
}

const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export async function signIn(formData: FormData): Promise<{ error?: string }> {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = signInSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: 'Preencha todos os campos corretamente.' };
    }

    await nextAuthSignIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/',
    });

    return {};
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    if (error instanceof AuthError) {
      return { error: 'Credenciais inválidas' };
    }
    return { error: error instanceof Error ? error.message : 'Erro ao entrar' };
  }
}

export async function signOut() {
  await nextAuthSignOut({ redirectTo: '/login' });
}

import {
  requestPasswordResetToken,
  resetUserPassword,
} from '@/modules/auth/application/password-reset';
import { DrizzlePasswordResetTokenRepository } from '@/modules/auth/infrastructure/password-reset-repository';

const forgotPasswordSchema = z.object({
  email: z.string().email('Informe um email válido.'),
});

export async function requestPasswordReset(
  formData: FormData
): Promise<{ error?: string; success?: boolean; token?: string; message?: string }> {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = forgotPasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: 'Informe um email válido.' };
    }

    const userRepo = new DrizzleUserRepository();
    const tokenRepo = new DrizzlePasswordResetTokenRepository();

    return await requestPasswordResetToken(userRepo, tokenRepo, parsed.data.email);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erro ao solicitar redefinição de senha' };
  }
}

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: z.string().min(6, 'A senha precisa ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export async function resetPassword(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = resetPasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || 'Dados inválidos.' };
    }

    const userRepo = new DrizzleUserRepository();
    const tokenRepo = new DrizzlePasswordResetTokenRepository();

    return await resetUserPassword(userRepo, tokenRepo, parsed.data.token, parsed.data.password);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erro ao redefinir a senha' };
  }
}

