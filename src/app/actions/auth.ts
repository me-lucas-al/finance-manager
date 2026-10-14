'use server';

import { AuthError } from 'next-auth';
import { db } from '@/db';
import { notificationPreferences, userSettings } from '@/db/schema';
import { hashPassword } from '@/modules/auth/domain/password';
import { userRepository } from '@/composition/users';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from '@/auth';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INVESTMENT_TYPES,
  signInSchema,
  signUpSchema,
} from './auth-schemas';
import { isNextRedirect } from './is-next-redirect';

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

    const existing = await userRepository.findByEmail(parsed.data.email);
    if (existing) {
      return { error: 'Email já cadastrado' };
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await userRepository.create({
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
    console.error('signUp failed:', error, error instanceof Error ? error.cause : undefined);
    return { error: error instanceof Error ? error.message : 'Erro ao criar conta' };
  }
}

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
