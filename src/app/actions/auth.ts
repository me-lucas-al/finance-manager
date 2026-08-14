'use server';

import { db } from '@/db/connection';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '@/lib/password';
import { setSessionCookie, deleteSessionCookie } from '@/lib/session';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

function checkRateLimit(): boolean {
  const ip = headers().get('x-forwarded-for') || headers().get('x-real-ip') || 'unknown';
  if (ip === 'unknown') return true;

  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 10; // Allow 10 attempts per 15 mins
  
  const record = rateLimitMap.get(ip);
  if (!record) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }
  
  if (now - record.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count += 1;
  return true;
}

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
});

export async function signup(formData: unknown) {
  try {
    if (!checkRateLimit()) {
      return { success: false, error: 'Muitas tentativas. Tente novamente mais tarde.' };
    }

    const validatedFields = signupSchema.safeParse(formData);

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { name, email, password } = validatedFields.data;

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      return {
        success: false,
        error: 'Este email já está em uso',
      };
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db.insert(users).values({
      name,
      email,
      passwordHash: hashedPassword,
    }).returning({ id: users.id });

    await setSessionCookie(newUser.id);

    return { success: true };
  } catch (_error) {
    return { success: false, error: 'Ocorreu um erro no servidor' };
  }
}

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(1, { message: 'Senha é obrigatória' }),
});

export async function login(formData: unknown) {
  try {
    if (!checkRateLimit()) {
      return { success: false, error: 'Muitas tentativas. Tente novamente mais tarde.' };
    }

    const validatedFields = loginSchema.safeParse(formData);

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { email, password } = validatedFields.data;

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return {
        success: false,
        error: 'Credenciais inválidas',
      };
    }

    const passwordsMatch = await verifyPassword(password, user.passwordHash);

    if (!passwordsMatch) {
      return {
        success: false,
        error: 'Credenciais inválidas',
      };
    }

    await setSessionCookie(user.id);

    return { success: true };
  } catch (_error) {
    return { success: false, error: 'Ocorreu um erro no servidor' };
  }
}

export async function logout() {
  await deleteSessionCookie();
  redirect('/login');
}
