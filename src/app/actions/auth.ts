'use server';

import { z } from 'zod';
import { AuthError } from 'next-auth';
import { db } from '@/db';
import { notificationPreferences, userSettings } from '@/db/schema';
import { hashPassword } from '@/modules/auth/domain/password';
import { DrizzleUserRepository } from '@/modules/users/infrastructure/repositories';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from '@/auth';

const DEFAULT_EXPENSE_CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Educação'];
const DEFAULT_INVESTMENT_TYPES = ['Reserva de Emergência', 'Renda Fixa', 'FIIs', 'Ações'];

const signUpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signUp(formData: FormData) {
  const parsed = signUpSchema.parse(Object.fromEntries(formData.entries()));
  const userRepo = new DrizzleUserRepository();

  const existing = await userRepo.findByEmail(parsed.email);
  if (existing) throw new Error('Email já cadastrado');

  const passwordHash = await hashPassword(parsed.password);
  const user = await userRepo.create({
    name: parsed.name,
    email: parsed.email,
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
      email: parsed.email,
      password: parsed.password,
      redirectTo: '/',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error('Conta criada, mas houve um erro ao entrar automaticamente. Faça login.');
    }
    throw error;
  }
}

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function signIn(formData: FormData) {
  const parsed = signInSchema.parse(Object.fromEntries(formData.entries()));

  try {
    await nextAuthSignIn('credentials', {
      email: parsed.email,
      password: parsed.password,
      redirectTo: '/',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error('Credenciais inválidas');
    }
    throw error;
  }
}

export async function signOut() {
  await nextAuthSignOut({ redirectTo: '/login' });
}
